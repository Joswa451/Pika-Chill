import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../features/cart/useCart'
import { createOrder } from '../../features/orders/ordersApi'

function peso(value) {
  return `₱${Number(value || 0).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function getSavedProfile() {
  try {
    return JSON.parse(sessionStorage.getItem('profile') || 'null') || {}
  } catch {
    return {}
  }
}

const ORDER_TYPES = [
  {
    value: 'pickup',
    label: 'Pickup',
    description: 'Collect at the counter',
    title: 'Pickup details',
    details: 'In-store pickup and takeout. We’ll prepare your order after it is confirmed. Please pay in cash at the counter when you collect it.',
    aside: 'Pickup or takeout at Pika-Chill. Cash payment at the counter.'
  },
  {
    value: 'dine_in',
    label: 'Dine-in',
    description: 'Order on the spot',
    title: 'Dine-in details',
    details: 'We’ll prepare your order and serve it at your table. Please pay in cash at the counter when you’re done.',
    aside: 'Dine-in at Pika-Chill. Cash payment at the counter.'
  },
  {
    value: 'outdoor',
    label: 'Outdoor seating',
    description: 'Eat at an outdoor table',
    title: 'Outdoor seating details',
    details: 'We’ll prepare your order and serve it at an outdoor table. Please pay in cash at the counter when you’re done.',
    aside: 'Outdoor seating at Pika-Chill. Cash payment at the counter.'
  }
]

function Checkout() {
  const { cart, total, clearCart } = useCart()
  const profile = getSavedProfile()
  const [orderType, setOrderType] = useState('pickup')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [placedOrder, setPlacedOrder] = useState(null)
  const navigate = useNavigate()
  const selectedOrderType = ORDER_TYPES.find((type) => type.value === orderType) || ORDER_TYPES[0]

  async function handleSubmit(event) {
    event.preventDefault()
    if (!cart.length || loading) return
    setLoading(true)
    setError('')
    try {
      const order = await createOrder({
        items: cart.map((item) => ({ product_id: item.product_id || item.id, quantity: Number(item.quantity) })),
        order_type: orderType
      })
      clearCart()
      setPlacedOrder(order)
    } catch (err) {
      setError(err.message || 'Could not place your order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (placedOrder) {
    return (
      <main className="page-wrap min-h-[60vh] py-14">
        <section className="mx-auto max-w-xl rounded-[1.4rem] border border-[#E2DBD0] bg-[#FFFDF9] p-10 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E8EDE7] text-2xl text-[#2F3B33]">✓</span>
          <p className="eyebrow mt-5">Thank you</p>
          <h1 className="display mt-2 text-[2.4rem] text-[#211E1A]">Order received</h1>
          <p className="mt-3 text-sm leading-6 text-[#776F65]">We’ll prepare your order for {selectedOrderType.label.toLowerCase()}. {selectedOrderType.value === 'pickup' ? 'Please pay at the counter when you collect it.' : 'Please pay at the counter when you’re done.'}</p>
          <p className="mt-5 text-sm font-medium text-[#211E1A]">Order #{String(placedOrder.id).slice(0, 8).toUpperCase()}</p>
          <button onClick={() => navigate('/customer/orders')} className="btn btn-primary mt-7">View my orders</button>
        </section>
      </main>
    )
  }

  return (
    <main className="page-wrap min-h-[60vh] py-10 sm:py-14">
      <button onClick={() => navigate('/customer/order')} className="mb-6 text-[0.78rem] font-semibold text-[#776F65] transition hover:text-[#211E1A]">← Back to order</button>
      <p className="eyebrow">Final step</p>
      <h1 className="display mt-3 text-[2.6rem] text-[#211E1A]">Place order</h1>
      <p className="mt-3 text-sm text-[#776F65]">Choose pickup, dine-in, or outdoor seating.</p>

      {!cart.length ? <section className="card mt-7 p-8"><p className="font-medium">Your order is empty.</p><Link className="mt-4 inline-block text-sm font-semibold text-[#B25F6C]" to="/customer/menu">Browse menu</Link></section> : (
        <form onSubmit={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <section className="card p-6">
              <h2 className="display text-xl text-[#211E1A]">How would you like your order?</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {ORDER_TYPES.map((type) => (
                  <label key={type.value} className={`cursor-pointer rounded-xl border p-4 transition ${orderType === type.value ? 'border-[#211E1A] bg-[#F1ECE4]' : 'border-[#E2DBD0] hover:border-[#D3C9BB]'}`}>
                    <input type="radio" name="order_type" value={type.value} checked={orderType === type.value} onChange={(event) => setOrderType(event.target.value)} className="sr-only" />
                    <span className="block text-sm font-semibold text-[#211E1A]">{type.label}</span>
                    <span className="mt-1 block text-[0.72rem] leading-5 text-[#776F65]">{type.description}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="card p-6">
              <h2 className="display text-xl text-[#211E1A]">{selectedOrderType.title}</h2>
              <p className="mt-4 text-sm font-medium text-[#211E1A]">Pika-Chill — Main branch</p>
              <p className="mt-2 text-sm leading-6 text-[#776F65]">{selectedOrderType.details}</p>
              <p className="mt-2 text-[0.72rem] text-[#948B7F]">Estimated preparation time: 20–30 minutes after confirmation.</p>
            </section>

            <section className="card p-6">
              <h2 className="display text-xl text-[#211E1A]">Contact details</h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div><dt className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#948B7F]">Full name</dt><dd className="mt-1.5 text-sm font-medium text-[#211E1A]">{profile.full_name || 'Add your name in My profile'}</dd></div>
                <div><dt className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#948B7F]">Contact number</dt><dd className="mt-1.5 text-sm font-medium text-[#211E1A]">{profile.contact_number || 'Add your number in My profile'}</dd></div>
              </dl>
              <Link to="/customer/profile" className="mt-4 inline-block text-[0.78rem] font-semibold text-[#B25F6C] hover:underline">Update profile</Link>
            </section>

            <section className="card p-6">
              <h2 className="display text-xl text-[#211E1A]">Order items</h2>
              <div className="mt-3 divide-y divide-[#E2DBD0]">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between gap-4 py-4">
                    <div><p className="text-sm font-medium text-[#211E1A]">{item.name}</p><p className="mt-1 text-[0.78rem] text-[#776F65]">Quantity: {item.quantity}</p></div>
                    <p className="shrink-0 text-sm font-medium text-[#211E1A]">{peso(Number(item.price) * Number(item.quantity))}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="card h-fit p-6">
            <h2 className="display text-xl text-[#211E1A]">{selectedOrderType.label} &amp; payment</h2>
            <p className="mt-3 text-sm leading-6 text-[#776F65]">{selectedOrderType.aside}</p>
            <div className="mt-5 flex justify-between border-t border-[#E2DBD0] pt-4 text-base font-semibold text-[#211E1A]"><span>Total</span><span>{peso(total)}</span></div>
            {error && <p role="alert" className="mt-4 rounded-xl border border-[#E6C3BE] bg-[#F8E9E6] p-3 text-sm text-[#9F3A32]">{error}</p>}
            <button disabled={loading} className="btn btn-primary mt-5 w-full py-3">{loading ? 'Placing order…' : 'Place order'}</button>
          </aside>
        </form>
      )}
    </main>
  )
}

export default Checkout
