import { API_URL } from '../../lib/apiBase'

function authHeaders(extra = {}) {
  let session
  try { session = JSON.parse(sessionStorage.getItem('session') || 'null') } catch { session = null }
  if (!session?.access_token) throw new Error('Please log in again to update your profile.')
  return { ...extra, Authorization: `Bearer ${session.access_token}` }
}

async function parseResponse(res, fallback) {
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || fallback)
  return data
}

export async function getMyProfile() {
  return parseResponse(await fetch(`${API_URL}/profile/me`, { headers: authHeaders() }), 'Failed to load profile')
}

export async function getCustomerProfiles() {
  return parseResponse(
    await fetch(`${API_URL}/profile/customers`, { headers: authHeaders() }),
    'Failed to load customer profiles'
  )
}

export async function updateMyProfile(profile) {
  return parseResponse(await fetch(`${API_URL}/profile/me`, {
    method: 'PUT',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(profile)
  }), 'Failed to update profile')
}
