// Small in-process cache for the public profile data returned after a
// successful login. Authentication still happens on every request; this only
// avoids repeating the profile lookup for the same account in a short window.
const TTL_MS = Number(process.env.AUTH_PROFILE_CACHE_TTL_MS) || 60 * 1000
const MAX_ENTRIES = 1000

const cache = new Map()

function getCachedProfile(id) {
  const entry = cache.get(id)
  if (!entry) return null

  if (entry.expiresAt <= Date.now()) {
    cache.delete(id)
    return null
  }

  // Refresh insertion order so the oldest unused entry is evicted first.
  cache.delete(id)
  cache.set(id, entry)
  return entry.profile
}

function setCachedProfile(id, profile) {
  if (!id || !profile) return

  if (cache.size >= MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value
    if (oldestKey !== undefined) cache.delete(oldestKey)
  }

  cache.set(id, {
    profile,
    expiresAt: Date.now() + TTL_MS
  })
}

function invalidateCachedProfile(id) {
  if (id) {
    cache.delete(id)
    return
  }

  cache.clear()
}

module.exports = {
  getCachedProfile,
  setCachedProfile,
  invalidateCachedProfile
}
