import { API_URL } from '../../lib/apiBase'
import { authFetch } from '../../lib/authFetch'

async function parseResponse(res, fallback) {
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || fallback)
  return data
}

export async function getMyProfile() {
  return parseResponse(await authFetch(`${API_URL}/profile/me`), 'Failed to load profile')
}

export async function getCustomerProfiles() {
  return parseResponse(
    await authFetch(`${API_URL}/profile/customers`),
    'Failed to load customer profiles'
  )
}

export async function updateMyProfile(profile) {
  return parseResponse(await authFetch(`${API_URL}/profile/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  }), 'Failed to update profile')
}
