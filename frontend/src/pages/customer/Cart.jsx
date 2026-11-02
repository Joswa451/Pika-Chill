import { useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../features/cart/useCart'
import { getProductStock, useProducts } from '../../features/products/useProducts'

function peso(value) {
  return `₱${Number(value || 0).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function Cart() {
  const { cart, total, updateQuantity, removeItem } = useCart()
  const { products, fetchProducts } = useProducts()
  const navigate = useNavigate()

  useEffect(() => { fetchProducts().catch(() => {}) }, [fetchProducts])

  const stockById = useMemo(
    () => new Map(products.map((product) => [String(product.id), getProductStock(product)])),
    [products]
  )

  function getItemStock(item) {
    return stockById.get(String(item.id)) ?? getProductStock(item)
  }

  const hasStockIssue = cart.some((item) => {
    const stock = getItemStock(item)
    return stock <= 0 || Number(item.quantity) > stock
  })

  return (
    <main className="page-wrap min-h-[60vh] py-10 sm:py-14">
      <p className="eyebrow">Pickup order</p>
      <h1 className="display mt-3 text-[2.6rem] text-[#211E1A]">Your order</h1>
      <p className="mt-3 text-sm text-[#776F65]">Review your items before placing your order.</p>

      {!cart.length ? (
        <section className="card mt-8 p-12 text-center">
          <p className="display text-2xl text-[#211E1A]">Your order is empty.</p>
          <p className="mt-2 text-sm text-[#776F65]">Choose some items from the menu first.</p>
          <Link to="/customer/menu" className="btn btn-primary btn-sm mt-6">Browse menu</Link>
        </section>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="table-shell">
            {cart.map((item) => {
              const stock = getItemStock(item)

              return (
                <article key={item.id} className="flex flex-col gap-4 border-b border-[#E2DBD0] p-5 last:border-0 sm:flex-row sm:items-center">
                  {item.image_url ? <img src={item.image_url} alt={item.name} className="h-24 w-full rounded-xl object-cover sm:w-24" /> : <div className="flex h-24 w-full items-end rounded-xl bg-[linear-gradient(145deg,#EDE8DF,#D8D0C3)] p-3 sm:w-24"><span className="text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-[#776F65]">Fresh</span></div>}
                  <div className="min-w-0 flex-1">
                    <h2 className="display text-lg text-[#211E1A]">{item.name}</h2>
                    <p className="mt-1 text-sm text-[#776F65]">{peso(item.price)} each</p>
                    {stock <= 0 ? (
                      <p className="mt-1 text-[0.72rem] font-semibold text-[#9F3A32]">Out of stock</p>
                    ) : Number(item.quantity) >= stock ? (
                      <p className="mt-1 text-[0.72rem] font-semibold text-[#8A5A2B]">Only {stock} available</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1 rounded-full border border-[#E2DBD0] bg-[#FFFDF9] p-1">
                    <button onClick={() => updateQuantity(item.id, Number(item.quantity) - 1, stock)} className="h-8 w-8 rounded-full text-base font-medium transition hover:bg-[#F1ECE4]" aria-label="Decrease quantity">−</button>
                    <span className="min-w-6 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, Number(item.quantity) + 1, stock)} disabled={stock <= 0 || Number(item.quantity) >= stock} className="h-8 w-8 rounded-full text-base font-medium transition hover:bg-[#F1ECE4] disabled:cursor-not-allowed disabled:opacity-40" aria-label="Increase quantity">+</button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-left text-[0.72rem] font-semibold text-[#9F3A32] hover:underline">Remove</button>
                </article>
              )
            })}
          </section>

          <aside className="card h-fit p-6">
            <h2 className="display text-xl text-[#211E1A]">Order summary</h2>
            <div className="mt-5 flex justify-between text-sm text-[#776F65]"><span>Items</span><span>{cart.reduce((n, item) => n + Number(item.quantity), 0)}</span></div>
            <div className="mt-4 flex justify-between border-t border-[#E2DBD0] pt-4 text-base font-semibold text-[#211E1A]"><span>Total</span><span>{peso(total)}</span></div>
            <p className="mt-5 rounded-xl border border-[#E2DBD0] bg-[#F1ECE4] p-3.5 text-[0.72rem] leading-5 text-[#776F65]">In-store pickup or takeout. Pay at the counter when you collect your order.</p>
            {hasStockIssue && <p role="alert" className="mt-3 rounded-xl border border-[#E6C3BE] bg-[#F8E9E6] p-3.5 text-[0.72rem] leading-5 text-[#9F3A32]">Some items are out of stock or exceed the available quantity. Adjust your order before placing it.</p>}
            <button onClick={() => navigate('/customer/place-order')} disabled={hasStockIssue} className="btn btn-primary mt-5 w-full py-3 disabled:cursor-not-allowed disabled:opacity-50">Continue to place order</button>
            <Link to="/customer/menu" className="mt-3 block text-center text-[0.78rem] font-semibold text-[#B25F6C] hover:underline">Continue shopping</Link>
          </aside>
        </div>
      )}
    </main>
  )
}

export default Cart
