import { useCallback, useEffect, useState } from 'react'
import { getMyOrders } from '../../features/orders/ordersApi'

const statusSteps = [
  { key: 'pending', label: 'Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' }
]

function formatPeso(value) {
  return `₱${(Number(value) || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`
}

function formatDate(value) {
  if (!value) return ''

  return new Date(value).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric'
  })
}

function normalizeStatus(status) {
  return String(status || 'pending')
    .toLowerCase()
    .replaceAll('_', ' ')
}

function getCurrentStep(status) {
  const normalizedStatus = normalizeStatus(status)

  if (normalizedStatus === 'confirmed') return 1
  if (normalizedStatus === 'preparing') return 2
  if (
    normalizedStatus === 'ready' ||
    normalizedStatus === 'ready for pickup' ||
    normalizedStatus === 'completed'
  ) {
    return 3
  }

  return 0
}

function getStatusBadgeStyle(status) {
  const normalizedStatus = normalizeStatus(status)

  if (normalizedStatus === 'completed') {
    return 'bg-[#E8EDE7] text-[#2F3B33]'
  }

  if (normalizedStatus === 'cancelled') {
    return 'bg-[#F8E9E6] text-[#9F3A32]'
  }

  if (normalizedStatus === 'preparing' || normalizedStatus === 'ready' || normalizedStatus === 'ready for pickup') {
    return 'bg-[#F5EADF] text-[#8A5A2B]'
  }

  return 'bg-[#F1ECE4] text-[#776F65]'
}

function getOrderItemName(item) {
  return item.product?.name || item.products?.name || 'Product'
}

function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadOrders = useCallback(async function loadOrders() {
    setLoading(true)
    setError(null)

    try {
      const data = await getMyOrders()
      setOrders(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(loadOrders)
    window.addEventListener('pikachill-order-updated', loadOrders)

    return () => {
      window.removeEventListener('pikachill-order-updated', loadOrders)
    }
  }, [loadOrders])

  return (
    <main className="min-h-[60vh]">
      <div className="page-wrap py-10 sm:py-14">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-[#E2DBD0] pb-6">
          <div>
            <p className="eyebrow">Your order updates</p>
            <h1 className="display mt-3 text-[2.6rem] text-[#211E1A]">My orders</h1>
            <p className="mt-3 text-sm text-[#776F65]">See your order status and when it’s ready for pickup.</p>
          </div>

          <button type="button" onClick={loadOrders} disabled={loading} className="btn btn-outline btn-sm">
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {error && (
          <p className="mb-5 rounded-xl border border-[#E6C3BE] bg-[#F8E9E6] p-4 text-sm text-[#9F3A32]">
            {error}
          </p>
        )}

        {loading ? (
          <p className="py-16 text-center text-sm text-[#776F65]">Loading your orders…</p>
        ) : !error && orders.length === 0 ? (
          <section className="card max-w-4xl p-8">
            <p className="display text-xl text-[#211E1A]">You don’t have any orders yet.</p>
            <p className="mt-2 text-sm text-[#776F65]">Your order status will appear here after you place an order.</p>
          </section>
        ) : (
          <section className="max-w-4xl space-y-4">
            {orders.map((order) => {
              const status = normalizeStatus(order.status)
              const currentStep = getCurrentStep(status)
              const items = order.order_items || []
              const isCompleted = status === 'completed'
              const isCancelled = status === 'cancelled'

              const itemSummary = items
                .map(
                  (item) =>
                    `${Number(item.quantity || 0)}× ${getOrderItemName(item)}`
                )
                .join(' · ')

              return (
                <article key={order.id} className="card p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[#776F65]">
                      Order #{String(order.id).slice(0, 8).toUpperCase()}
                    </h2>

                    <span className={`rounded-full px-3 py-1 text-[0.66rem] font-semibold capitalize ${getStatusBadgeStyle(status)}`}>
                      {status}
                    </span>
                  </div>

                  {!isCompleted && !isCancelled && (
                    <div className="mt-7 grid grid-cols-4">
                      {statusSteps.map((step, index) => {
                        const isDone = index < currentStep
                        const isCurrent = index === currentStep

                        return (
                          <div key={step.key} className="relative flex flex-col items-center text-center">
                            {index > 0 && (
                              <span className={`absolute right-1/2 top-4 h-px w-full ${index <= currentStep ? 'bg-[#2F3B33]' : 'bg-[#E2DBD0]'}`} />
                            )}

                            <span className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-[0.68rem] font-semibold ${isDone ? 'bg-[#2F3B33] text-white' : isCurrent ? 'bg-[#B25F6C] text-white' : 'bg-[#F1ECE4] text-[#948B7F]'}`}>
                              {isDone ? '✓' : index + 1}
                            </span>

                            <span className={`mt-2 text-[0.7rem] ${isCurrent ? 'font-semibold text-[#211E1A]' : 'text-[#776F65]'}`}>
                              {step.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {isCancelled && (
                    <p className="mt-5 rounded-xl bg-[#F8E9E6] p-3 text-sm text-[#9F3A32]">
                      This order was cancelled.
                    </p>
                  )}

                  <div className="mt-5 border-t border-[#E2DBD0] pt-4 text-[0.8rem] leading-6 text-[#776F65]">
                    {itemSummary || 'Order items'}
                    {' — '}
                    Total {formatPeso(order.total_amount)}
                    {' · '}
                    {isCompleted
                      ? `Completed${order.updated_at ? ` ${formatDate(order.updated_at)}` : ''}`
                      : 'Pay at counter on pickup'}
                  </div>
                </article>
              )
            })}
          </section>
        )}
      </div>
    </main>
  )
}

export default MyOrders
