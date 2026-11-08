const buckets = new Map()

function createRateLimiter({ name, windowMs, max, message }) {
  function middleware(req, res, next) {
    const now = Date.now()
    const key = `${name}:${req.ip || req.socket?.remoteAddress || 'unknown'}`
    let bucket = buckets.get(key)

    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs }
      buckets.set(key, bucket)
    }

    bucket.count += 1

    if (bucket.count > max) {
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
      res.set('Retry-After', String(retryAfter))
      return res.status(429).json({ error: message })
    }

    next()
  }

  return middleware
}

function positiveNumber(value, fallback) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const windowMs = positiveNumber(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 5 * 60 * 1000)

const loginRateLimiter = createRateLimiter({
  name: 'login',
  windowMs,
  max: positiveNumber(process.env.AUTH_LOGIN_RATE_LIMIT, 30),
  message: 'Too many login attempts. Please wait a few minutes and try again.'
})

const registerRateLimiter = createRateLimiter({
  name: 'register',
  windowMs,
  max: positiveNumber(process.env.AUTH_REGISTER_RATE_LIMIT, 10),
  message: 'Too many registration attempts. Please wait a few minutes and try again.'
})

// Keep the in-memory buckets bounded on long-running servers.
const cleanupTimer = setInterval(() => {
  const now = Date.now()
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}, windowMs)

if (typeof cleanupTimer.unref === 'function') cleanupTimer.unref()

module.exports = { loginRateLimiter, registerRateLimiter }
