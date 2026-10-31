import { API_URL } from '../../lib/apiBase'

function authHeaders(extra = {}) {
  let session
  try { session = JSON.parse(sessionStorage.getItem('session') || 'null') } catch { session = null }
  if (!session?.access_token) throw new Error('Please log in again to view your notifications.')
  return { ...extra, Authorization: `Bearer ${session.access_token}` }
}

async function parseResponse(res, fallback) {
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || fallback)
  return data
}

export async function getMyNotifications() {
  return parseResponse(await fetch(`${API_URL}/notifications/mine`, { headers: authHeaders() }), 'Failed to get notifications')
}

// Consume the backend's authenticated Server-Sent Events stream. The backend
// relays Supabase Realtime changes without exposing database write privileges.
export async function streamMyNotifications(onNotification, signal) {
  const res = await fetch(`${API_URL}/notifications/stream`, {
    headers: authHeaders(),
    signal
  })

  if (!res.ok || !res.body) {
    await parseResponse(res, 'Could not connect to live notifications')
    throw new Error('Could not connect to live notifications')
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (!signal?.aborted) {
    const { value, done } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    let boundary = buffer.indexOf('\n\n')
    while (boundary !== -1) {
      const frame = buffer.slice(0, boundary)
      buffer = buffer.slice(boundary + 2)
      const event = frame.match(/^event:\s*(.+)$/m)?.[1]
      const data = frame.split('\n').filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trim()).join('\n')

      if (event === 'notification' && data) {
        try { onNotification(JSON.parse(data)) } catch { /* Ignore malformed frames. */ }
      }
      boundary = buffer.indexOf('\n\n')
    }
  }
}

export async function markNotificationAsRead(id) {
  return parseResponse(await fetch(`${API_URL}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: authHeaders()
  }), 'Failed to mark notification as read')
}
