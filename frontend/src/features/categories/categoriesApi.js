import { API_URL } from '../../lib/apiBase'

function getAuthHeaders(extraHeaders = {}) {
  let session
  try {
    session = JSON.parse(sessionStorage.getItem('session') || 'null')
  } catch {
    session = null
  }

  if (!session?.access_token) {
    throw new Error('Please log in again to manage categories.')
  }

  return { ...extraHeaders, Authorization: `Bearer ${session.access_token}` }
}

// Get all categories
export async function getCategories() {
  const res = await fetch(`${API_URL}/categories`)
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Failed to get categories')
  }

  return data
}

// Create a category
export async function createCategory(category) {
  const res = await fetch(`${API_URL}/categories`, {
    method: 'POST',
    headers: getAuthHeaders({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify(category)
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Failed to create category')
  }

  return data
}

// Update a category
export async function updateCategory(id, category) {
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify(category)
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Failed to update category')
  }

  return data
}

// Delete a category
export async function deleteCategory(id) {
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete category')
  }

  return data
}
