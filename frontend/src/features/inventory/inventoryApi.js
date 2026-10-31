import { API_URL } from '../../lib/apiBase'

function getAuthHeaders(extraHeaders = {}) {
  let session
  try {
    session = JSON.parse(sessionStorage.getItem('session') || 'null')
  } catch {
    session = null
  }

  if (!session?.access_token) {
    throw new Error('Please log in again to manage inventory.')
  }

  return { ...extraHeaders, Authorization: `Bearer ${session.access_token}` }
}

// Get all inventory records
export async function getInventory() {
  const res = await fetch(`${API_URL}/inventory`, { headers: getAuthHeaders() })
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Failed to get inventory')
  }

  return data
}

// Create an inventory record
export async function createInventory(inventory) {
  const res = await fetch(`${API_URL}/inventory`, {
    method: 'POST',
    headers: getAuthHeaders({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify(inventory)
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Failed to create inventory')
  }

  return data
}

// Update an inventory record
export async function updateInventory(id, inventory) {
  const res = await fetch(`${API_URL}/inventory/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify(inventory)
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Failed to update inventory')
  }

  return data
}

// Delete an inventory record
export async function deleteInventory(id) {
  const res = await fetch(`${API_URL}/inventory/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete inventory')
  }

  return data
}
