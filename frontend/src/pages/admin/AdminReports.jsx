import { useEffect, useMemo, useState } from 'react'
import { useSales } from '../../features/sales/useSales'
import { useOrders } from '../../features/orders/useOrders'
import { useProducts } from '../../features/products/useProducts'

const pad = (n) => String(n).padStart(2, '0')
const dateKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
const monthKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
function mondayOf(date) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7))
  return result
}
function peso(value) {
  return `₱${(Number(value) || 0).toLocaleString('en-PH', { maximumFractionDigits: 2 })}`
}

function AdminReports() {
  const { sales, fetchSales, loading, error } = useSales()
  const { orders, fetchOrders, loading: ordersLoading, error: ordersError } = useOrders()
  const { products, fetchProducts, loading: productsLoading, error: productsError } = useProducts()
  const [range, setRange] = useState('daily')
  useEffect(() => {
    fetchSales().catch(() => {})
    fetchOrders().catch(() => {})
    fetchProducts().catch(() => {})
  }, [fetchOrders, fetchProducts, fetchSales])

  const chart = useMemo(() => {
    const today = new Date()
    const bins = []
    if (range === 'daily') {
      for (let offset = 6; offset >= 0; offset -= 1) {
        const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset)
        bins.push({ key: dateKey(date), label: date.toLocaleDateString('en', { weekday: 'short' }), value: 0, count: 0 })
      }
    } else if (range === 'weekly') {
      const thisMonday = mondayOf(today)
      for (let offset = 6; offset >= 0; offset -= 1) {
        const date = new Date(thisMonday)
        date.setDate(date.getDate() - offset * 7)
        bins.push({ key: dateKey(date), label: date.toLocaleDateString('en', { month: 'short', day: 'numeric' }), value: 0, count: 0 })
      }
    } else {
      for (let offset = 5; offset >= 0; offset -= 1) {
        const date = new Date(today.getFullYear(), today.getMonth() - offset, 1)
        bins.push({ key: monthKey(date), label: date.toLocaleDateString('en', { month: 'short' }), value: 0, count: 0 })
      }
    }

    const bucketByKey = new Map(bins.map((bin) => [bin.key, bin]))
    for (const sale of sales) {
      if (!sale.sold_at) continue
      const date = new Date(sale.sold_at)
      if (Number.isNaN(date.getTime())) continue
      const key = range === 'daily' ? dateKey(date) : range === 'weekly' ? dateKey(mondayOf(date)) : monthKey(date)
      const bin = bucketByKey.get(key)
      if (bin) {
        bin.value += Number(sale.total_amount) || 0
        bin.count += 1
      }
    }
    return bins
  }, [sales, range])

  const total = chart.reduce((sum, bin) => sum + bin.value, 0)
  const max = Math.max(1, ...chart.map((bin) => bin.value))
  const filteredCount = chart.reduce((sum, bin) => sum + bin.count, 0)
  const chartKeys = new Set(chart.map((bin) => bin.key))
  const orderById = new Map(orders.map((order) => [String(order.id), order]))
  const productById = new Map(products.map((product) => [String(product.id), product]))
  const bestSellers = sales.reduce((totals, sale) => {
    if (!sale.sold_at) return totals
    const date = new Date(sale.sold_at)
    if (Number.isNaN(date.getTime())) return totals
    const key = range === 'daily' ? dateKey(date) : range === 'weekly' ? dateKey(mondayOf(date)) : monthKey(date)
    if (!chartKeys.has(key)) return totals

    const order = orderById.get(String(sale.order_id))
    for (const item of order?.order_items || []) {
      const productId = String(item.product_id)
      const product = productById.get(productId)
      if (!product) continue
      const current = totals.get(productId) || { id: productId, name: product.name, units: 0 }
      current.units += Number(item.quantity) || 0
      totals.set(productId, current)
    }
    return totals
  }, new Map())
  const rankedProducts = [...bestSellers.values()].sort((a, b) => b.units - a.units).slice(0, 5)
  const pageLoading = loading || ordersLoading || productsLoading
  const pageError = error || ordersError || productsError

  async function refreshReport() {
    await Promise.allSettled([fetchSales(), fetchOrders(), fetchProducts()])
  }

  return <section>
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><h1 className="display text-[2rem]">Sales / Reports</h1><p className="mt-1 text-sm text-[#776F65]">Recorded revenue from completed and paid orders</p></div><button type="button" onClick={refreshReport} disabled={pageLoading} className="rounded-lg border border-[#D3C9BB] bg-[#FFFDF9] px-4 py-2 text-sm font-bold text-[#776F65] hover:text-[#211E1A] disabled:opacity-50">{pageLoading ? 'Refreshing…' : 'Refresh'}</button></header>
    {pageError && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{pageError}</p>}
    <div className="mb-5 flex flex-wrap gap-2">{['daily', 'weekly', 'monthly'].map((item) => <button key={item} type="button" aria-pressed={range === item} onClick={() => setRange(item)} className={`rounded-lg border px-4 py-2 text-sm font-bold capitalize transition ${range === item ? 'border-[#211E1A] bg-[#211E1A] text-white' : 'border-[#D3C9BB] bg-[#FFFDF9] text-[#776F65] hover:text-[#211E1A]'}`}>{item}</button>)}</div>
    <div className="mb-5 grid gap-4 sm:grid-cols-3">
      {[['Total revenue', pageLoading ? '…' : peso(total)], ['Completed sales', pageLoading ? '…' : String(filteredCount)], ['Average sale', pageLoading ? '…' : peso(filteredCount ? total / filteredCount : 0)]].map(([label, value]) => <article key={label} className="rounded-[1.1rem] border border-[#E2DBD0] bg-[#FFFDF9] p-5"><p className="text-sm text-[#776F65]">{label}</p><strong className="mt-2 block display text-[2rem]">{value}</strong></article>)}
    </div>
    <div className="grid gap-5 xl:grid-cols-2">
      <section className="rounded-[1.1rem] border border-[#E2DBD0] bg-[#FFFDF9] p-5 sm:p-6"><h2 className="mb-5 font-semibold">Revenue · {range === 'daily' ? 'last 7 days' : range === 'weekly' ? 'last 7 weeks' : 'last 6 months'}</h2><div className="flex h-48 items-end gap-2 border-b border-[#E2DBD0] pb-0 sm:gap-3">{chart.map((bin) => <div key={bin.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"><span className="mb-1 truncate text-[10px] text-[#776F65]">{bin.value ? peso(bin.value) : ''}</span><div className="w-full rounded-t-md bg-[#B25F6C]" style={{ height: `${bin.value ? Math.max(7, (bin.value / max) * 72) : 0}%` }} title={`${bin.label}: ${peso(bin.value)}`} /><span className="mt-2 text-[10px] font-semibold text-[#776F65]">{bin.label}</span></div>)}</div>{!pageLoading && sales.length === 0 && <p className="mt-4 text-sm text-[#776F65]">No sales recorded yet.</p>}</section>
      <section className="overflow-hidden rounded-[1.1rem] border border-[#E2DBD0] bg-[#FFFDF9]"><div className="px-5 py-5 sm:px-6"><h2 className="font-semibold">Best-selling products</h2><p className="mt-1 text-sm text-[#776F65]">Units sold during the selected period</p></div><div className="overflow-x-auto"><table className="w-full min-w-[360px] border-collapse text-left text-sm"><thead className="bg-[#F1ECE4] text-[#776F65]"><tr><th className="px-4 py-3 font-semibold">Product</th><th className="px-4 py-3 font-semibold">Units sold</th></tr></thead><tbody>{rankedProducts.map((product) => <tr key={product.id} className="border-t border-[#E2DBD0]"><td className="px-4 py-3">{product.name}</td><td className="px-4 py-3 font-semibold">{product.units}</td></tr>)}{!pageLoading && rankedProducts.length === 0 && <tr><td colSpan="2" className="px-4 py-8 text-center text-[#776F65]">No product sales for this period.</td></tr>}</tbody></table></div>{pageLoading && <p className="border-t border-[#E2DBD0] px-4 py-3 text-sm text-[#776F65]">Loading report…</p>}</section>
    </div>
  </section>
}

export default AdminReports
