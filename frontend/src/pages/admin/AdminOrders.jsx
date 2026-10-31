import { useCallback, useEffect, useMemo, useState } from 'react'
import { useOrders } from '../../features/orders/useOrders'
import { getProductStock, useProducts } from '../../features/products/useProducts'
import { getCustomerProfiles } from '../../features/profile/profileApi'

function formatPeso(value) {
  return `₱${(Number(value) || 0).toLocaleString('en-PH', { maximumFractionDigits: 2 })}`
}

function getStatusClass(status) {
  const value = String(status || '').toLowerCase()
  if (value === 'preparing') return 'bg-[#F5EADF] text-[#8A5A2B]'
  if (value === 'confirmed') return 'bg-[#F5EADF] text-[#8A5A2B]'
  if (value === 'ready') return 'bg-[#E8EDE7] text-[#2F3B33]'
  if (value === 'completed') return 'bg-[#E8EDE7] text-[#2F3B33]'
  if (value === 'cancelled') return 'bg-red-100 text-red-700'
  return 'bg-[#F1ECE4] text-[#948B7F]'
}

function getNextAction(order) {
  const status = String(order.status || '').toLowerCase()
  if (status === 'pending') return { label: 'Confirm', updates: { status: 'confirmed' } }
  if (status === 'confirmed') return { label: 'Start preparing', updates: { status: 'preparing' } }
  if (status === 'preparing') return { label: 'Mark ready', updates: { status: 'ready' } }
  if (status === 'ready') return { label: 'Complete order', updates: { status: 'completed', payment_status: 'paid' } }
  return null
}

function getOrderTypeLabel(value) {
  const type = String(value || 'pickup').toLowerCase()
  if (type === 'dine_in') return 'Dine-in'
  if (type === 'outdoor') return 'Outdoor seating'
  return 'Pickup'
}

function AdminOrders() {
  const { orders, fetchOrders, addWalkInOrder, editOrder, cancelOrder, loading: ordersLoading, error: ordersError } = useOrders()
  const { products, fetchProducts, loading: productsLoading, error: productsError } = useProducts()
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [profiles, setProfiles] = useState([])
  const [profilesLoading, setProfilesLoading] = useState(true)
  const [profilesError, setProfilesError] = useState(null)
  const [actionNotice, setActionNotice] = useState('')
  const [showWalkInForm, setShowWalkInForm] = useState(false)
  const [walkInType, setWalkInType] = useState('dine_in')
  const [walkInItems, setWalkInItems] = useState([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [walkInError, setWalkInError] = useState('')
  const [creatingWalkIn, setCreatingWalkIn] = useState(false)

  const requestProfiles = useCallback(() => getCustomerProfiles(), [])

  const fetchProfiles = useCallback(async function fetchProfiles() {
    setProfilesLoading(true)
    setProfilesError(null)
    try {
      setProfiles(await requestProfiles())
    } catch (fetchError) {
      setProfilesError(fetchError.message)
    } finally {
      setProfilesLoading(false)
    }
  }, [requestProfiles])

  useEffect(() => {
    fetchOrders().catch(() => {})
    fetchProducts().catch(() => {})
    requestProfiles()
      .then((data) => setProfiles(data))
      .catch((fetchError) => setProfilesError(fetchError.message))
      .finally(() => setProfilesLoading(false))
  }, [fetchOrders, fetchProducts, requestProfiles])

  const profilesById = useMemo(
    () => new Map(profiles.map((profile) => [String(profile.id), profile])),
    [profiles]
  )

  const visibleOrders = useMemo(() => orders.map((order) => ({
    ...order,
    customerProfile: profilesById.get(String(order.customer_id))
  })).filter((order) => {
    const status = String(order.status || '').toLowerCase()
    const matchesStatus = statusFilter === 'all' || status === statusFilter
    const itemNames = (order.order_items || []).map((item) => item.product?.name || '').join(' ')
    const customerName = order.customerProfile?.full_name || ''
    const customerContact = order.customerProfile?.contact_number || ''
    const orderType = getOrderTypeLabel(order.order_type)
    const text = `${order.id} ${order.customer_id || ''} ${customerName} ${customerContact} ${itemNames} ${status} ${orderType}`.toLowerCase()
    return matchesStatus && text.includes(query.trim().toLowerCase())
  }), [orders, profilesById, query, statusFilter])

  const walkInProducts = useMemo(
    () => products.filter((product) => product.is_available && getProductStock(product) > 0),
    [products]
  )

  const walkInTotal = useMemo(
    () => walkInItems.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0),
    [walkInItems]
  )

  function handleAddWalkInItem(event) {
    event.preventDefault()
    setWalkInError('')

    const product = products.find((entry) => String(entry.id) === String(selectedProductId))
    if (!product) {
      setWalkInError('Choose a product first.')
      return
    }

    const stock = getProductStock(product)
    const existing = walkInItems.find((item) => String(item.product_id) === String(product.id))
    const remaining = Math.max(0, stock - Number(existing?.quantity || 0))
    if (remaining <= 0) {
      setWalkInError(`${product.name} has no remaining stock.`)
      return
    }

    const quantity = Math.min(Math.max(1, Math.floor(Number(selectedQuantity) || 1)), remaining)
    setWalkInItems((current) => existing
      ? current.map((item) => String(item.product_id) === String(product.id) ? { ...item, quantity: Number(item.quantity) + quantity } : item)
      : [...current, { product_id: product.id, name: product.name, price: Number(product.price), quantity }])
    setSelectedProductId('')
    setSelectedQuantity(1)
  }

  function removeWalkInItem(productId) {
    setWalkInItems((current) => current.filter((item) => String(item.product_id) !== String(productId)))
  }

  async function handleCreateWalkIn(event) {
    event.preventDefault()
    if (!walkInItems.length || creatingWalkIn) return

    setCreatingWalkIn(true)
    setWalkInError('')
    setActionNotice('')
    try {
      await addWalkInOrder({
        items: walkInItems.map((item) => ({ product_id: item.product_id, quantity: item.quantity })),
        order_type: walkInType
      })
      setWalkInItems([])
      setWalkInType('dine_in')
      setShowWalkInForm(false)
      setActionNotice('Walk-in order created.')
    } catch (error) {
      setWalkInError(error.message)
    } finally {
      setCreatingWalkIn(false)
    }
  }

  async function handleStatusUpdate(order, updates) {
    setUpdatingOrderId(order.id)
    setActionNotice('')
    try {
      const result = await editOrder(order.id, updates)
      setActionNotice(result.warning || 'Order updated successfully.')
    } catch {
      // The hook stores the API error for the page alert.
    } finally {
      setUpdatingOrderId(null)
    }
  }

  async function handleCancelOrder(order) {
    if (!window.confirm(`Cancel order #${String(order.id).slice(0, 8)}? Its reserved stock will be returned.`)) return
    setUpdatingOrderId(order.id)
    setActionNotice('')
    try {
      const result = await cancelOrder(order.id)
      setActionNotice(result.warning || 'Order cancelled and stock returned.')
    } catch {
      // The hook stores the API error for the page alert.
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const pageLoading = ordersLoading || productsLoading || profilesLoading
  const pageError = ordersError || productsError || profilesError

  return (
    <section>
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="display text-[2rem]">Orders</h1><p className="mt-1 text-sm text-[#776F65]">Manage incoming orders and walk-ins</p></div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setShowWalkInForm((visible) => !visible)} className="rounded-lg bg-[#211E1A] px-4 py-2 text-sm font-bold text-white hover:bg-[#3A352E]">{showWalkInForm ? 'Close walk-in form' : 'New walk-in order'}</button>
          <button type="button" onClick={() => { fetchOrders().catch(() => {}); fetchProducts().catch(() => {}); fetchProfiles() }} disabled={pageLoading} className="rounded-lg border border-[#D3C9BB] bg-[#FFFDF9] px-4 py-2 text-sm font-bold text-[#776F65] hover:text-[#211E1A] disabled:opacity-50">{pageLoading ? 'Refreshing…' : 'Refresh'}</button>
        </div>
      </header>

      {pageError && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{pageError}</div>}
      {actionNotice && <div role="status" className="mb-5 rounded-xl border border-[#D3C9BB] bg-[#E8EDE7] px-4 py-3 text-sm text-[#2F3B33]">{actionNotice}</div>}

      {showWalkInForm && (
        <section className="mb-5 rounded-[1.1rem] border border-[#E2DBD0] bg-[#FFFDF9] p-5">
          <h2 className="display text-xl text-[#211E1A]">New walk-in order</h2>
          <p className="mt-1 text-sm text-[#776F65]">For customers ordering on the spot or at an outdoor table.</p>

          <form onSubmit={handleCreateWalkIn} className="mt-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <select value={selectedProductId} onChange={(event) => setSelectedProductId(event.target.value)} aria-label="Walk-in product" className="rounded-xl border border-[#E2DBD0] bg-[#FFFDF9] px-4 py-2.5 text-sm outline-none focus:border-[#B25F6C]">
                <option value="">Select a dish</option>
                {walkInProducts.map((product) => (
                  <option key={product.id} value={product.id}>{product.name} — {formatPeso(product.price)} ({getProductStock(product)} left)</option>
                ))}
              </select>
              <input type="number" min="1" value={selectedQuantity} onChange={(event) => setSelectedQuantity(event.target.value)} aria-label="Quantity" className="w-full rounded-xl border border-[#E2DBD0] bg-[#FFFDF9] px-4 py-2.5 text-sm outline-none focus:border-[#B25F6C] sm:w-24" />
              <button type="button" onClick={handleAddWalkInItem} className="rounded-lg border border-[#D3C9BB] px-4 py-2.5 text-sm font-bold text-[#776F65] hover:text-[#211E1A]">Add item</button>
            </div>

            {walkInItems.length > 0 && (
              <div className="divide-y divide-[#E2DBD0] rounded-xl border border-[#E2DBD0]">
                {walkInItems.map((item) => (
                  <div key={item.product_id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <span className="font-medium text-[#211E1A]">{item.name} ×{item.quantity}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[#776F65]">{formatPeso(Number(item.price) * Number(item.quantity))}</span>
                      <button type="button" onClick={() => removeWalkInItem(item.product_id)} className="text-xs font-bold text-red-700 hover:underline">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-end justify-between gap-3 border-t border-[#E2DBD0] pt-4">
              <label className="block text-sm font-medium text-[#211E1A]">
                <span className="mb-1.5 block text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#948B7F]">Order type</span>
                <select value={walkInType} onChange={(event) => setWalkInType(event.target.value)} className="rounded-xl border border-[#E2DBD0] bg-[#FFFDF9] px-4 py-2.5 text-sm outline-none focus:border-[#B25F6C]">
                  <option value="dine_in">Dine-in / on the spot</option>
                  <option value="outdoor">Outdoor seating</option>
                  <option value="pickup">Pickup</option>
                </select>
              </label>
              <p className="text-sm font-semibold text-[#211E1A]">Total {formatPeso(walkInTotal)}</p>
              <button type="submit" disabled={!walkInItems.length || creatingWalkIn} className="rounded-lg bg-[#211E1A] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#3A352E] disabled:cursor-not-allowed disabled:opacity-50">{creatingWalkIn ? 'Creating…' : 'Create walk-in order'}</button>
            </div>

            {walkInError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{walkInError}</p>}
          </form>
        </section>
      )}

      <div className="mb-4 flex flex-wrap gap-3">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order, customer, or item" aria-label="Search orders" className="w-full max-w-sm rounded-xl border border-[#E2DBD0] bg-[#FFFDF9] px-4 py-2.5 text-sm outline-none focus:border-[#B25F6C]" />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter orders by status" className="rounded-xl border border-[#E2DBD0] bg-[#FFFDF9] px-4 py-2.5 text-sm outline-none focus:border-[#B25F6C]">
          <option value="all">All statuses</option>
          {['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'].map((status) => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}
        </select>
        <span className="self-center text-sm text-[#776F65]">{visibleOrders.length} {visibleOrders.length === 1 ? 'order' : 'orders'}</span>
      </div>

      <div className="overflow-hidden rounded-[1.1rem] border border-[#E2DBD0] bg-[#FFFDF9]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
            <thead className="bg-[#F1ECE4] text-[#776F65]"><tr><th className="px-4 py-4 font-medium">Order ID</th><th className="px-4 py-4 font-medium">Customer</th><th className="px-4 py-4 font-medium">Type</th><th className="px-4 py-4 font-medium">Items</th><th className="px-4 py-4 font-medium">Total</th><th className="px-4 py-4 font-medium">Payment</th><th className="px-4 py-4 font-medium">Status</th><th className="px-4 py-4 font-medium">Action</th></tr></thead>
            <tbody>
              {visibleOrders.map((order) => {
                const nextAction = getNextAction(order)
                const orderItems = order.order_items || []
                const itemsText = orderItems.map((item) => {
                  const product = item.product || products.find((entry) => String(entry.id) === String(item.product_id))
                  return `${product?.name || `Product ${String(item.product_id || '').slice(0, 6)}`} ×${item.quantity}`
                }).join(', ')
                return (
                  <tr key={order.id} className="border-t border-[#E2DBD0]">
                    <td className="px-4 py-4">#{String(order.id).slice(0, 8)}</td>
                    <td className="px-4 py-4">{order.customerProfile?.full_name || (order.customer_id ? `Customer ${String(order.customer_id).slice(0, 6)}` : 'Walk-in')}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{getOrderTypeLabel(order.order_type)}</td>
                    <td className="max-w-[260px] px-4 py-4">{itemsText || 'No items'}</td>
                    <td className="px-4 py-4">{formatPeso(order.total_amount)}</td>
                    <td className="px-4 py-4 capitalize">{order.payment_status || 'Unpaid'}</td>
                    <td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusClass(order.status)}`}>{order.status || 'Unknown'}</span></td>
                    <td className="px-4 py-4"><div className="flex flex-wrap gap-2">{nextAction && <button type="button" disabled={pageLoading || updatingOrderId === order.id} onClick={() => handleStatusUpdate(order, nextAction.updates)} className="whitespace-nowrap rounded-lg bg-[#211E1A] px-4 py-2 text-xs font-bold text-white hover:bg-[#3A352E] disabled:cursor-not-allowed disabled:opacity-50">{updatingOrderId === order.id ? 'Updating…' : nextAction.label}</button>}{!['completed', 'cancelled'].includes(String(order.status || '').toLowerCase()) && <button type="button" disabled={pageLoading || updatingOrderId === order.id} onClick={() => handleCancelOrder(order)} className="whitespace-nowrap rounded-lg border border-red-300 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">Cancel</button>}</div></td>
                  </tr>
                )
              })}
              {!pageLoading && visibleOrders.length === 0 && <tr><td colSpan="8" className="px-4 py-10 text-center text-[#776F65]">{query || statusFilter !== 'all' ? 'No orders match these filters.' : 'No orders found.'}</td></tr>}
            </tbody>
          </table>
        </div>
        {pageLoading && <p className="border-t border-[#E2DBD0] px-4 py-3 text-sm text-[#776F65]">Loading orders…</p>}
      </div>
    </section>
  )
}

export default AdminOrders
