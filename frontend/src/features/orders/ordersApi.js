import { API_URL } from '../../lib/apiBase'

// Read the login token and add it to request headers
function getAuthHeaders(extraHeaders = {}) {
  let session

  try {
    session = JSON.parse(sessionStorage.getItem('session') || 'null')
  } catch {
    session = null
  }

  const token = session?.access_token

  if (!token) {
    throw new Error('Please log in again to access your orders.')
  }

  return {
    ...extraHeaders,
    Authorization: `Bearer ${token}`
  }
}

// Get all orders for the admin
export async function getOrders() {
  const res = await fetch(`${API_URL}/orders`, {
    headers: getAuthHeaders()
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Failed to get orders')
  }

  return data
}

// Get orders for the signed-in customer
export async function getMyOrders() {
  const res = await fetch(`${API_URL}/orders/mine`, {
    headers: getAuthHeaders()
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Failed to get your orders')
  }

  return data
}

// Create an order for the signed-in customer
// Format: { items: [{ product_id, quantity }] }
export async function createOrder(order) {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: getAuthHeaders({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify(order)
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Failed to create order')
  }

  return data
}

// Create an on-the-spot order for a walk-in customer; for admin
export async function createWalkInOrder(order) {
  const res = await fetch(`${API_URL}/orders/walk-in`, {
    method: 'POST',
    headers: getAuthHeaders({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify(order)
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Failed to create walk-in order')
  }

  return data
}

// update  orders; for admin
export async function updateOrder(id, updates) {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify(updates)
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Failed to update order')
  }

  return data
}

// Cancel an order; confirm that the backend route allows this action
export async function cancelOrder(id) {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Failed to cancel order')
  }

  return data
}
