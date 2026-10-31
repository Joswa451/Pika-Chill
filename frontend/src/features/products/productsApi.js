import { API_URL } from '../../lib/apiBase'
import { authFetch } from '../../lib/authFetch'

function createProductFormData(product, imageFile) {
  const formData = new FormData()
  formData.append('name', product.name)
  formData.append('description', product.description || '')
  formData.append('price', String(product.price))
  formData.append('is_available', String(Boolean(product.is_available)))
  formData.append('category_id', product.category_id || '')
  if (imageFile) formData.append('image', imageFile)
  return formData
}

// Get all products
export async function getProducts() {
  const res = await fetch(`${API_URL}/products`)
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Failed to get products')
  }

  return data
}

// Create a product and let the backend upload its optional image.
export async function createProduct(product, imageFile) {
  const res = await authFetch(`${API_URL}/products`, {
    method: 'POST',
    body: createProductFormData(product, imageFile)
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Failed to create product')
  }

  return data
}

// Update a product and optionally replace its image through the backend.
export async function updateProduct(id, product, imageFile) {
  const res = await authFetch(`${API_URL}/products/${id}`, {
    method: 'PUT',
    body: createProductFormData(product, imageFile)
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Failed to update product')
  }

  return data
}

// Delete a product
export async function deleteProduct(id) {
  const res = await authFetch(`${API_URL}/products/${id}`, {
    method: 'DELETE'
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete product')
  }

  return data
}
