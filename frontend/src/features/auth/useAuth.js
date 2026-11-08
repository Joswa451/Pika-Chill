import { useRef, useState } from 'react'
import { registerRequest, loginRequest } from './authApi'

function readStoredAuth() {
  try {
    const user = JSON.parse(sessionStorage.getItem('user') || 'null')
    const profile = JSON.parse(sessionStorage.getItem('profile') || 'null')
    const session = JSON.parse(sessionStorage.getItem('session') || 'null')

    // These values must all belong to the same signed-in account. Otherwise
    // the UI can show a cached admin page while the API receives another
    // account's token and rejects its requests.
    const ids = [user?.id, profile?.id, session?.user?.id]
    if (ids.some((id) => !id) || !ids.every((id) => id === ids[0])) {
      clearStoredAuth()
      return { user: null, profile: null }
    }

    return { user, profile }
  } catch {
    clearStoredAuth()
    return { user: null, profile: null }
  }
}

function clearStoredAuth() {
  sessionStorage.removeItem('user')
  sessionStorage.removeItem('profile')
  sessionStorage.removeItem('session')
}

function storeLogin(data) {
  const userId = data.user?.id

  if (!userId || data.profile?.id !== userId || data.session?.user?.id !== userId) {
    clearStoredAuth()
    throw new Error('Login returned mismatched account details. Please sign in again.')
  }

  // Replace the complete auth set together so older values cannot survive a
  // partial login response and be paired with the new token after refresh.
  clearStoredAuth()
  sessionStorage.setItem('user', JSON.stringify(data.user))
  sessionStorage.setItem('profile', JSON.stringify(data.profile))
  sessionStorage.setItem('session', JSON.stringify(data.session))
}

export function useAuth() {
  const [storedAuth] = useState(readStoredAuth)
  const [user, setUser] = useState(storedAuth.user)
  const [profile, setProfile] = useState(storedAuth.profile)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const requestRef = useRef(null)

  function runAuthRequest(execute) {
    // A ref guard is synchronous, so a double-click cannot start two requests
    // before React has re-rendered the disabled button.
    if (requestRef.current) return requestRef.current

    setError(null)
    setLoading(true)

    const promise = (async () => {
      try {
        return await execute()
      } catch (err) {
        setError(err.message || 'Something went wrong. Please try again.')
        throw err
      } finally {
        requestRef.current = null
        setLoading(false)
      }
    })()

    requestRef.current = promise
    return promise
  }

  async function register(formData) {
    const data = await runAuthRequest(() => registerRequest(formData))

    // When email confirmation is disabled Supabase returns a session and the
    // user is signed in immediately. Otherwise keep the old session untouched.
    if (data.session && data.user && data.profile) {
      storeLogin(data)
      setUser(data.user)
      setProfile(data.profile)
    }

    return data
  }

  async function login(formData) {
    const data = await runAuthRequest(() => loginRequest(formData))
    storeLogin(data)
    setUser(data.user)
    setProfile(data.profile)

    return data
  }

  function logout() {
    setError(null)

    clearStoredAuth()

    setUser(null)
    setProfile(null)
  }

  function clearError() {
    setError(null)
  }

  return {
    user,
    profile,
    login,
    register,
    logout,
    loading,
    error,
    clearError
  }
}
