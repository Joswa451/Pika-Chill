import { API_URL } from './apiBase'

const LOGIN_AGAIN = 'Your session has expired. Please log in again.'

export function getStoredSession() {
  try {
    return JSON.parse(sessionStorage.getItem('session') || 'null')
  } catch {
    return null
  }
}

export function clearStoredSession() {
  sessionStorage.removeItem('user')
  sessionStorage.removeItem('profile')
  sessionStorage.removeItem('session')
}

function saveSession(data) {
  if (data.session) sessionStorage.setItem('session', JSON.stringify(data.session))
  if (data.user) sessionStorage.setItem('user', JSON.stringify(data.user))
  if (data.profile) sessionStorage.setItem('profile', JSON.stringify(data.profile))
}

function isExpired(session) {
  const expiresAt = Number(session?.expires_at)
  return Number.isFinite(expiresAt) && expiresAt * 1000 <= Date.now() + 30000
}

let refreshPromise = null

async function refreshStoredSession() {
  const session = getStoredSession()
  if (!session?.refresh_token) return null

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: session.refresh_token })
        })

        const data = await res.json().catch(() => null)
        if (!res.ok || !data?.session?.access_token) return null

        saveSession(data)
        return data.session
      } catch {
        return null
      } finally {
        refreshPromise = null
      }
    })()
  }

  return refreshPromise
}

export async function authFetch(input, init = {}) {
  let session = getStoredSession()

  if (!session?.access_token && !session?.refresh_token) {
    throw new Error('Please log in again to continue.')
  }

  if (!session?.access_token || isExpired(session)) {
    session = await refreshStoredSession()
    if (!session?.access_token) {
      clearStoredSession()
      throw new Error(LOGIN_AGAIN)
    }
  }

  const send = (token) => fetch(input, {
    ...init,
    headers: { ...(init.headers || {}), Authorization: `Bearer ${token}` }
  })

  const res = await send(session.access_token)
  if (res.status !== 401) return res

  const refreshed = await refreshStoredSession()
  if (!refreshed?.access_token) {
    clearStoredSession()
    throw new Error(LOGIN_AGAIN)
  }

  return send(refreshed.access_token)
}
