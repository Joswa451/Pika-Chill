import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProductStock, useProducts } from '../../features/products/useProducts'
import { useCategories } from '../../features/categories/useCategories'
import { useCart } from '../../features/cart/useCart'

function peso(value) { return `₱${Number(value || 0).toLocaleString('en-PH', { maximumFractionDigits: 2 })}` }

function ProductDetails() {
  const { id } = useParams()
  const { products, fetchProducts, loading, error } = useProducts()
  const { categories, fetchCategories } = useCategories()
  const { cart, addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  useEffect(() => { fetchProducts().catch(() => {}); fetchCategories().catch(() => {}) }, [fetchProducts, fetchCategories])
  const product = useMemo(() => products.find((item) => String(item.id) === id), [products, id])
  const category = categories.find((item) => String(item.id) === String(product?.category_id))?.name || 'Uncategorized'
  const stock = getProductStock(product)
  const inCart = cart.find((item) => String(item.id) === String(id))
  const remaining = Math.max(0, stock - Number(inCart?.quantity || 0))
  const soldOut = !product?.is_available || stock <= 0
  const selectedQuantity = Math.max(1, Math.min(quantity, remaining || 1))

  if (loading && !products.length) return <main className="page-wrap min-h-[60vh] py-16 text-sm text-[#776F65]">Loading product…</main>
  if (error && !product) return <main className="page-wrap min-h-[60vh] py-16"><h1 className="display text-3xl text-[#211E1A]">We couldn’t load this product.</h1><p role="alert" className="mt-3 text-sm text-[#9F3A32]">{error}</p><button type="button" onClick={() => fetchProducts().catch(() => {})} className="btn btn-outline btn-sm mt-5">Try again</button><Link to="/customer/menu" className="ml-4 inline-block text-sm font-semibold text-[#B25F6C]">Back to menu</Link></main>
  if (!product) return <main className="page-wrap min-h-[60vh] py-16"><h1 className="display text-3xl text-[#211E1A]">Product not found</h1><p className="mt-2 text-sm text-[#776F65]">This product may have been removed from the menu.</p><Link to="/customer/menu" className="mt-5 inline-block text-sm font-semibold text-[#B25F6C]">Back to menu</Link></main>

  return (
    <main className="page-wrap min-h-[60vh] py-10 sm:py-14">
      <Link to="/customer/menu" className="mb-7 inline-flex items-center gap-2 text-[0.78rem] font-semibold text-[#776F65] transition hover:text-[#211E1A]"><span aria-hidden="true">←</span> Back to menu</Link>
      <section className="grid overflow-hidden rounded-[1.6rem] border border-[#E2DBD0] bg-[#FFFDF9] md:grid-cols-2">
        {product.image_url ? <img src={product.image_url} alt={product.name} className="h-80 w-full object-cover md:h-full" /> : <div className="flex min-h-80 items-end bg-[linear-gradient(145deg,#EDE8DF,#D8D0C3)] p-8"><span className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#776F65]">Pika-Chill · Freshly made</span></div>}
        <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
          <p className="eyebrow">{category}</p>
          <h1 className="display mt-3 text-[2.5rem] leading-tight text-[#211E1A] sm:text-[3rem]">{product.name}</h1>
          <p className="mt-5 text-[0.95rem] leading-7 text-[#776F65]">{product.description || 'Freshly prepared to order.'}</p>
          <p className="mt-6 text-2xl font-semibold text-[#211E1A]">{peso(product.price)}</p>

          <div className="mt-7 rounded-2xl border border-[#E2DBD0] bg-[#F1ECE4] p-5">
            <p className="text-sm font-semibold text-[#211E1A]">In-store pickup & takeout · Pay at counter</p>
            <p className="mt-1 text-[0.8rem] leading-5 text-[#776F65]">We’ll prepare your order for pickup at Pika-Chill.</p>
          </div>

          <div className="mt-7 flex items-center gap-4">
            <span className="text-sm font-medium text-[#211E1A]">Quantity</span>
            <div className="flex items-center gap-1 rounded-full border border-[#E2DBD0] bg-[#FFFDF9] p-1">
              <button type="button" onClick={() => setQuantity(Math.max(1, selectedQuantity - 1))} disabled={selectedQuantity <= 1 || soldOut} aria-label="Decrease quantity" className="h-9 w-9 rounded-full text-lg font-medium transition hover:bg-[#F1ECE4] disabled:opacity-40">−</button>
              <span aria-live="polite" className="min-w-7 text-center text-sm font-semibold">{selectedQuantity}</span>
              <button type="button" onClick={() => setQuantity(Math.min(selectedQuantity + 1, remaining))} disabled={soldOut || selectedQuantity >= remaining} aria-label="Increase quantity" className="h-9 w-9 rounded-full text-lg font-medium transition hover:bg-[#F1ECE4] disabled:opacity-40">+</button>
            </div>
          </div>

          <button onClick={() => addItem(product, selectedQuantity)} disabled={soldOut || remaining <= 0} className="btn btn-primary mt-5 w-full py-3.5">
            {soldOut ? 'Out of stock' : remaining <= 0 ? 'All available stock is in your order' : `Add ${selectedQuantity} to order · ${peso(Number(product.price) * selectedQuantity)}`}
          </button>
        </div>
      </section>
    </main>
  )
}

export default ProductDetails
