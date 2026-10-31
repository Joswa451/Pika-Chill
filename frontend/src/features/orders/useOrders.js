import { useCallback, useState } from 'react'
import {
  getOrders,
  createOrder,
  createWalkInOrder,
  updateOrder,
  cancelOrder
} from './ordersApi'

export function useOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchOrders = useCallback(async function fetchOrders() {
    setLoading(true)
    setError(null)

    try {
      const data = await getOrders()
      setOrders(data)
      return data
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const addOrder = useCallback(async function addOrder(order) {
    setLoading(true)
    setError(null)

    try {
      const data = await createOrder(order)
      setOrders((previousOrders) => [...previousOrders, data])
      return data
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const addWalkInOrder = useCallback(async function addWalkInOrder(order) {
    setLoading(true)
    setError(null)

    try {
      const data = await createWalkInOrder(order)
      setOrders((previousOrders) => [data, ...previousOrders])
      return data
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const editOrder = useCallback(async function editOrder(id, updates) {
    setLoading(true)
    setError(null)

    try {
      const result = await updateOrder(id, updates)
      const updatedOrder = result.order || result

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.id === id ? updatedOrder : order
        )
      )

      return result
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const cancelExistingOrder = useCallback(async function cancelExistingOrder(id) {
    setLoading(true)
    setError(null)

    try {
      const result = await cancelOrder(id)
      const cancelledOrder = result.order || result

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.id === id ? cancelledOrder : order
        )
      )

      return result
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    orders,
    fetchOrders,
    addOrder,
    addWalkInOrder,
    editOrder,
    cancelOrder: cancelExistingOrder,
    loading,
    error
  }
}
