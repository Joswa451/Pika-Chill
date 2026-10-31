import { useCallback, useEffect, useState } from 'react'
import { getProductStock } from '../products/useProducts'

const CART_KEY = 'pikachill_cart'
const CART_EVENT = 'pikachill-cart-updated'

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]')
    if (!Array.isArray(saved)) return []

    return saved
      .filter((item) => item && (item.id ?? item.product_id) != null)
      .map((item) => {
        const id = item.id ?? item.product_id
        const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1))
        const price = Number(item.price)

        return {
          ...item,
          id,
          product_id: id,
          quantity,
          price: Number.isFinite(price) && price >= 0 ? price : 0
        }
      })
  } catch {
    return []
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
  window.dispatchEvent(new Event(CART_EVENT))
}

export function useCart() {
  const [cart, setCart] = useState(readCart)

  useEffect(() => {
    const sync = () => setCart(readCart())
    window.addEventListener(CART_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(CART_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const addItem = useCallback((product, quantity = 1) => {
    const current = readCart()
    const id = product.id ?? product.product_id
    if (id == null) return 0

    const stock = getProductStock(product)
    if (stock <= 0) return 0

    const amount = Math.max(1, Math.floor(Number(quantity) || 1))
    const existing = current.find((item) => String(item.id) === String(id))
    const nextQuantity = Math.min(Number(existing?.quantity || 0) + amount, stock)
    const next = existing
      ? current.map((item) => String(item.id) === String(id)
          ? { ...item, quantity: nextQuantity, stock_quantity: stock }
          : item)
      : [...current, {
          id,
          product_id: id,
          name: product.name,
          price: Number(product.price),
          image_url: product.image_url || null,
          quantity: nextQuantity,
          stock_quantity: stock
        }]
    saveCart(next)
    setCart(next)
    return nextQuantity
  }, [])

  const updateQuantity = useCallback((id, quantity, maxQuantity) => {
    const current = readCart()
    const item = current.find((entry) => String(entry.id) === String(id))
    if (!item) return

    const normalizedQuantity = Math.floor(Number(quantity))
    const rawLimit = maxQuantity ?? item.stock_quantity
    const hasLimit = rawLimit !== undefined && rawLimit !== null && rawLimit !== ''
    const limit = hasLimit ? getProductStock({ stock_quantity: rawLimit }) : Infinity
    const nextQuantity = Number.isFinite(normalizedQuantity) && normalizedQuantity > 0
      ? Math.min(normalizedQuantity, limit)
      : 0
    const next = nextQuantity <= 0
      ? current.filter((entry) => String(entry.id) !== String(id))
      : current.map((entry) => String(entry.id) === String(id)
          ? { ...entry, quantity: nextQuantity, stock_quantity: limit }
          : entry)
    saveCart(next)
    setCart(next)
  }, [])

  const removeItem = useCallback((id) => {
    const next = readCart().filter((item) => String(item.id) !== String(id))
    saveCart(next)
    setCart(next)
  }, [])

  const clearCart = useCallback(() => {
    saveCart([])
    setCart([])
  }, [])

  const count = cart.reduce((total, item) => total + Number(item.quantity || 0), 0)
  const total = cart.reduce((sum, item) => sum + Math.round(Number(item.price || 0) * 100) * Number(item.quantity || 0), 0) / 100
  return { cart, count, total, addItem, updateQuantity, removeItem, clearCart }
}
