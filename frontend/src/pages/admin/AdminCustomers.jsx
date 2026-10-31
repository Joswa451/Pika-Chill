import { useCallback, useEffect, useMemo, useState } from 'react'
import { useOrders } from '../../features/orders/useOrders'
import { useSales } from '../../features/sales/useSales'
import { getCustomerProfiles } from '../../features/profile/profileApi'

function peso(value) {
  return `₱${(Number(value) || 0).toLocaleString('en-PH', { maximumFractionDigits: 2 })}`
}

function AdminCustomers() {
  const { orders, fetchOrders, loading, error } = useOrders()
  const { sales, fetchSales, loading: salesLoading, error: salesError } = useSales()
  const [query, setQuery] = useState('')
  const [profiles, setProfiles] = useState([])
  const [profilesLoading, setProfilesLoading] = useState(true)
  const [profilesError, setProfilesError] = useState(null)

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
    fetchSales().catch(() => {})
    requestProfiles()
      .then((data) => setProfiles(data))
      .catch((fetchError) => setProfilesError(fetchError.message))
      .finally(() => setProfilesLoading(false))
  }, [fetchOrders, fetchSales, requestProfiles])

  const profilesById = useMemo(
    () => new Map(profiles.map((profile) => [String(profile.id), profile])),
    [profiles]
  )

  const customers = useMemo(() => {
    const groups = new Map()

    // Include every registered customer, even if they have not ordered yet.
    for (const profile of profiles) {
      if (profile.id) {
        groups.set(String(profile.id), {
          id: String(profile.id),
          orderCount: 0,
          total: 0,
          latestOrder: null
        })
      }
    }

    for (const order of orders) {
      if (!order.customer_id) continue
      const id = String(order.customer_id)
      const customer = groups.get(id) || { id, orderCount: 0, total: 0, latestOrder: null }
      customer.orderCount += 1
      if (!customer.latestOrder || new Date(order.created_at) > new Date(customer.latestOrder)) {
        customer.latestOrder = order.created_at
      }
      groups.set(id, customer)
    }

    // Sales only contain orders that were completed and paid.
    for (const sale of sales) {
      if (!sale.customer_id) continue
      const id = String(sale.customer_id)
      const customer = groups.get(id) || { id, orderCount: 0, total: 0, latestOrder: null }
      customer.total += Number(sale.total_amount) || 0
      groups.set(id, customer)
    }

    return [...groups.values()]
      .map((customer) => ({ ...customer, ...profilesById.get(customer.id) }))
      .filter((customer) => [customer.full_name, customer.contact_number, customer.id]
        .some((value) => String(value || '').toLowerCase().includes(query.trim().toLowerCase())))
      .sort((a, b) => b.orderCount - a.orderCount)
  }, [orders, sales, profiles, profilesById, query])

  const totalSpent = sales.reduce((sum, sale) => sum + (Number(sale.total_amount) || 0), 0)
  const loadingPage = loading || salesLoading || profilesLoading
  const pageError = error || salesError || profilesError

  async function refreshCustomers() {
    await Promise.allSettled([fetchOrders(), fetchSales(), fetchProfiles()])
  }

  return <section>
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><h1 className="display text-[2rem]">Customers</h1><p className="mt-1 text-sm text-[#776F65]">Customer activity and paid order totals</p></div><button type="button" onClick={refreshCustomers} disabled={loadingPage} className="rounded-lg border border-[#D3C9BB] bg-[#FFFDF9] px-4 py-2 text-sm font-bold text-[#776F65] hover:text-[#211E1A] disabled:opacity-50">{loadingPage ? 'Refreshing…' : 'Refresh'}</button></header>
    <div className="mb-5 grid gap-4 sm:grid-cols-3">
      <article className="rounded-[1.1rem] border border-[#E2DBD0] bg-[#FFFDF9] p-5"><p className="text-sm text-[#776F65]">Customers with orders</p><strong className="mt-2 block display text-[2rem]">{loadingPage ? '…' : new Set(orders.map((order) => order.customer_id).filter(Boolean)).size}</strong></article>
      <article className="rounded-[1.1rem] border border-[#E2DBD0] bg-[#FFFDF9] p-5"><p className="text-sm text-[#776F65]">Orders placed</p><strong className="mt-2 block display text-[2rem]">{loadingPage ? '…' : orders.length}</strong></article>
      <article className="rounded-[1.1rem] border border-[#E2DBD0] bg-[#FFFDF9] p-5"><p className="text-sm text-[#776F65]">Recorded paid sales</p><strong className="mt-2 block display text-[2rem]">{loadingPage ? '…' : peso(totalSpent)}</strong></article>
    </div>
    {pageError && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{pageError}</p>}
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="max-w-2xl text-sm text-[#776F65]">Customer names and contact numbers from registered profiles.</p><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customers" aria-label="Search customers" className="w-full max-w-xs rounded-xl border border-[#E2DBD0] bg-[#FFFDF9] px-4 py-2.5 text-sm outline-none focus:border-[#B25F6C]" /></div>
    <div className="overflow-hidden rounded-[1.1rem] border border-[#E2DBD0] bg-[#FFFDF9]"><div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm"><thead className="bg-[#F1ECE4] text-[#776F65]"><tr><th className="px-4 py-4 font-semibold">Customer</th><th className="px-4 py-4 font-semibold">Contact</th><th className="px-4 py-4 font-semibold">Orders placed</th><th className="px-4 py-4 font-semibold">Total spent</th><th className="px-4 py-4 font-semibold">Latest order</th></tr></thead><tbody>
        {customers.map((customer) => <tr key={customer.id} className="border-t border-[#E2DBD0]"><td className="px-4 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#C6A15B] font-bold text-[#211E1A]">{(customer.full_name || 'C').trim().charAt(0).toUpperCase()}</span><span className="font-medium">{customer.full_name || 'Name unavailable'}</span></div></td><td className="px-4 py-4 text-[#776F65]">{customer.contact_number || 'Not provided'}</td><td className="px-4 py-4">{customer.orderCount}</td><td className="px-4 py-4 font-semibold">{peso(customer.total)}</td><td className="px-4 py-4 text-[#776F65]">{customer.latestOrder ? new Date(customer.latestOrder).toLocaleDateString('en-PH') : '—'}</td></tr>)}
        {!loadingPage && customers.length === 0 && <tr><td colSpan="5" className="px-4 py-10 text-center text-[#776F65]">{query ? 'No customers match this search.' : 'No customer orders recorded yet.'}</td></tr>}
      </tbody></table>
    </div>{loadingPage && <p className="border-t border-[#E2DBD0] px-4 py-3 text-sm text-[#776F65]">Loading customers…</p>}</div>
  </section>
}

export default AdminCustomers
