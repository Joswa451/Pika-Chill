import { useCallback, useEffect, useMemo, useState } from 'react'
import { useOrders } from '../../features/orders/useOrders'
import { useSales } from '../../features/sales/useSales'
import { useInventory } from '../../features/inventory/useInventory'
import { getCustomerProfiles } from '../../features/profile/profileApi'
import { useNavigate } from 'react-router-dom'

function isToday(value) {
  if (!value) return false

  const date = new Date(value)
  const today = new Date()

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

function formatPeso(value) {
  const amount = Number(value) || 0
  return `₱${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`
}

function getStatusStyle(status) {
  const normalizedStatus = String(status || '').toLowerCase()

  if (normalizedStatus === 'preparing') {
    return 'bg-[#F5EADF] text-[#8A5A2B]'
  }

  if (normalizedStatus === 'ready') {
    return 'bg-[#E8EDE7] text-[#2F3B33]'
  }

  if (normalizedStatus === 'completed') {
    return 'bg-[#E8EDE7] text-[#2F3B33]'
  }

  return 'bg-[#F1ECE4] text-[#948B7F]'
}

function AdminOverview() {
  const navigate = useNavigate()
  const {
    orders,
    fetchOrders,
    loading: ordersLoading,
    error: ordersError
  } = useOrders()

  const {
    sales,
    fetchSales,
    loading: salesLoading,
    error: salesError
  } = useSales()

  const {
    inventory,
    fetchInventory,
    loading: inventoryLoading,
    error: inventoryError
  } = useInventory()

  const [loadError, setLoadError] = useState(null)
  const [profiles, setProfiles] = useState([])

  const fetchProfiles = useCallback(async () => {
    try {
      const data = await getCustomerProfiles()
      setProfiles(data)
      return data
    } catch (profileError) {
      setLoadError(profileError.message)
      throw profileError
    }
  }, [])

  const profilesById = useMemo(
    () => new Map(profiles.map((profile) => [String(profile.id), profile])),
    [profiles]
  )

  useEffect(() => {
    let isMounted = true

    async function loadOverviewData() {
      const results = await Promise.allSettled([
        fetchOrders(),
        fetchSales(),
        fetchInventory(),
        fetchProfiles()
      ])

      const errors = [...new Set(results
        .filter((result) => result.status === 'rejected')
        .map((result) => result.reason?.message || 'Could not load dashboard data'))]

      if (isMounted && errors.length > 0) {
        setLoadError(errors.join('. '))
      }
    }

    loadOverviewData()

    return () => {
      isMounted = false
    }
  }, [fetchInventory, fetchOrders, fetchProfiles, fetchSales])

  const ordersToday = orders.filter((order) => isToday(order.created_at))

  const revenueTodayInCents = sales
    .filter((sale) => isToday(sale.sold_at))
    .reduce((total, sale) => {
      return total + Math.round((Number(sale.total_amount) || 0) * 100)
    }, 0)

  const pendingOrders = orders.filter(
    (order) => String(order.status).toLowerCase() === 'pending'
  )

  const lowStockItems = inventory.filter((item) => {
    return Number(item.stock_quantity) <= Number(item.low_stock_threshold)
  })

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3)

  const loading = ordersLoading || salesLoading || inventoryLoading
  const error = loadError || ordersError || salesError || inventoryError
  const todayLabel = new Date().toLocaleDateString('en-PH', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  })

  async function refreshOverview() {
    setLoadError(null)
    await Promise.allSettled([fetchOrders(), fetchSales(), fetchInventory(), fetchProfiles()])
  }

  return (
    <>
      <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="display text-[2rem]">Overview</h1>
          <p className="mt-1 text-sm text-[#776F65]">
            Today&apos;s snapshot · {todayLabel}
          </p>
        </div>

        <div className="flex gap-2">
          <button type="button" onClick={refreshOverview} disabled={loading} className="rounded-lg border border-[#D3C9BB] bg-[#FFFDF9] px-4 py-2 text-sm font-bold text-[#776F65] hover:text-[#211E1A] disabled:opacity-50">{loading ? 'Refreshing…' : 'Refresh'}</button>
          <button type="button" onClick={() => navigate('/admin/reports')} className="rounded-lg bg-[#211E1A] px-4 py-2 text-sm font-bold text-white hover:bg-[#3A352E]">View sales report</button>
        </div>
      </header>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[1.1rem] border border-[#E2DBD0] bg-[#FFFDF9] p-5">
          <p className="text-sm text-[#776F65]">Orders today</p>
          <strong className="mt-2 block stat-value">
            {loading ? '…' : ordersToday.length}
          </strong>
        </article>

        <article className="rounded-[1.1rem] border border-[#E2DBD0] bg-[#FFFDF9] p-5">
          <p className="text-sm text-[#776F65]">Revenue today</p>
          <strong className="mt-2 block stat-value">
            {loading ? '…' : formatPeso(revenueTodayInCents / 100)}
          </strong>
        </article>

        <article className="rounded-[1.1rem] border border-[#E2DBD0] bg-[#FFFDF9] p-5">
          <p className="text-sm text-[#776F65]">Pending orders</p>
          <strong className="mt-2 block stat-value">
            {loading ? '…' : pendingOrders.length}
          </strong>
        </article>

        <article className="rounded-[1.1rem] border border-[#E2DBD0] bg-[#FFFDF9] p-5">
          <p className="text-sm text-[#776F65]">Low-stock items</p>
          <strong className="mt-2 block stat-value">
            {loading ? '…' : lowStockItems.length}
          </strong>
        </article>
      </section>

      <section className="overflow-hidden rounded-[1.1rem] border border-[#E2DBD0] bg-[#FFFDF9]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] border-collapse text-left text-sm">
            <thead className="bg-[#F1ECE4] text-[#776F65]">
              <tr>
                <th className="px-4 py-4 font-medium">Order</th>
                <th className="px-4 py-4 font-medium">Customer</th>
                <th className="px-4 py-4 font-medium">Items</th>
                <th className="px-4 py-4 font-medium">Total</th>
                <th className="px-4 py-4 font-medium">Status</th>
              </tr>
            </thead>

            <tbody>
              {recentOrders.map((order) => {
                const itemCount = (order.order_items || []).reduce(
                  (total, item) => total + Number(item.quantity || 0),
                  0
                )

                return (
                  <tr key={order.id} className="border-t border-[#E2DBD0]">
                    <td className="px-4 py-4">
                      #{String(order.id).slice(0, 8)}
                    </td>
                    <td className="px-4 py-4">
                      {profilesById.get(String(order.customer_id))?.full_name ||
                        (order.customer_id
                          ? `Customer ${String(order.customer_id).slice(0, 6)}`
                          : '—')}
                    </td>
                    <td className="px-4 py-4">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </td>
                    <td className="px-4 py-4">
                      {formatPeso(order.total_amount)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(order.status)}`}
                      >
                        {order.status || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                )
              })}

              {!loading && recentOrders.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-8 text-center text-[#776F65]"
                  >
                    No orders to show yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

export default AdminOverview
