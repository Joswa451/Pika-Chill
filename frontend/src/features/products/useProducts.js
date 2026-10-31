import { useCallback, useState } from 'react'
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from './productsApi'

export function getProductStock(product) {
  const rawStock = product?.stock_quantity ?? product?.inventory?.stock_quantity
  const stock = Number(rawStock)
  return Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : 0
}

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch all products
  const fetchProducts = useCallback(async function fetchProducts() {
    setLoading(true)
    setError(null)

    try {
      const data = await getProducts()
      setProducts(data)
      return data
    } catch (error) {
      console.error(error.message)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Add a product
  const addProduct = useCallback(async function addProduct(product, imageFile) {
    setLoading(true)
    setError(null)

    try {
      const data = await createProduct(product, imageFile)
      setProducts((previousProducts) => [...previousProducts, data])
      return data
    } catch (error) {
      console.error(error.message)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Edit a product
  const editProduct = useCallback(async function editProduct(id, product, imageFile) {
    setLoading(true)
    setError(null)

    try {
      const data = await updateProduct(id, product, imageFile)
      setProducts((previousProducts) =>
        previousProducts.map((item) => (String(item.id) === String(id) ? data : item))
      )
      return data
    } catch (error) {
      console.error(error.message)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Remove a product
  const removeProduct = useCallback(async function removeProduct(id) {
    setLoading(true)
    setError(null)

    try {
      const data = await deleteProduct(id)
      setProducts((previousProducts) =>
        previousProducts.filter((item) => String(item.id) !== String(id))
      )
      return data
    } catch (error) {
      console.error(error.message)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    products,
    fetchProducts,
    addProduct,
    editProduct,
    removeProduct,
    loading,
    error
  }
}
