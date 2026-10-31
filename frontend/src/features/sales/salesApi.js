import { API_URL } from '../../lib/apiBase'

function getAuthHeaders(extraHeaders = {}) {
  let session
  try {
    session = JSON.parse(sessionStorage.getItem('session') || 'null')
  } catch {
    session = null
  }

  if (!session?.access_token) {
    throw new Error('Please log in again to access sales reports.')
  }

  return { ...extraHeaders, Authorization: `Bearer ${session.access_token}` }
}

// Get all sales
export async function getSales() {
  const res = await fetch(`${API_URL}/sales`, { headers: getAuthHeaders() })
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Failed to get sales')
  }

  return data
}

// Get sales summary
export async function getSalesSummary() {
  const res = await fetch(`${API_URL}/sales/summary`, { headers: getAuthHeaders() })
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Failed to get sales summary')
  }

  return data
}

// Create a sale from an order
export async function createSale(order_id) {
  const res = await fetch(`${API_URL}/sales`, {
    method: 'POST',
    headers: getAuthHeaders({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify({ order_id })
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Failed to create sale')
  }

  return data
}
