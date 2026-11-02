import { useEffect, useMemo, useState } from 'react'
import { getProductStock, useProducts } from '../../features/products/useProducts'
import { useCategories } from '../../features/categories/useCategories'
import { useCart } from '../../features/cart/useCart'
import { Link } from 'react-router-dom'

function formatPeso(value) {
  return `₱${(Number(value) || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`
}

function CustomerMenu() {
  const { cart, addItem } = useCart()
  const {
    products,
    fetchProducts,
    loading: productsLoading,
    error: productsError
  } = useProducts()

  const {
    categories,
    fetchCategories,
    loading: categoriesLoading,
    error: categoriesError
  } = useCategories()

  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchProducts().catch(() => {})
    fetchCategories().catch(() => {})
  }, [fetchProducts, fetchCategories])

  const availableProducts = useMemo(
    () => products.filter((product) => product.is_available),
    [products]
  )

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()

    return availableProducts.filter((product) => {
      const matchesCategory =
        activeCategory === 'all' || String(product.category_id) === String(activeCategory)

      const matchesSearch =
        !query ||
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)

      return matchesCategory && matchesSearch
    })
  }, [availableProducts, activeCategory, search])

  function getCategoryName(categoryId) {
    return categories.find((category) => String(category.id) === String(categoryId))?.name ||
      'Uncategorized'
  }

  function getCartQuantity(productId) {
    return cart.reduce(
      (total, item) => String(item.id) === String(productId) ? total + Number(item.quantity || 0) : total,
      0
    )
  }

  const loading = productsLoading || categoriesLoading
  const error = productsError || categoriesError

  return (
    <main className="min-h-[65vh] py-10 sm:py-14">
      <div className="page-wrap flex flex-col gap-8 lg:flex-row lg:gap-12">
        <aside className="w-full shrink-0 lg:sticky lg:top-28 lg:h-fit lg:w-64">
        <p className="eyebrow">Our menu</p>
        <h1 className="display mt-3 text-[2.6rem] text-[#211E1A]">Menu</h1>
        <p className="mt-3 text-sm leading-6 text-[#776F65]">Freshly prepared Filipino favorites. In-store pickup, takeout, and delivery available.</p>

        <label className="mt-7 block">
          <span className="field-label">Search menu</span>
          <div className="relative">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#948B7F]" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="11" cy="11" r="7" /><path strokeLinecap="round" d="m20 20-3.5-3.5" /></svg>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Find a dish"
              className="field pl-10"
            />
          </div>
        </label>

        <p className="mb-3 mt-7 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#948B7F]">Categories</p>

        <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`shrink-0 rounded-full px-4 py-2 text-left text-[0.78rem] font-medium transition lg:w-full ${activeCategory === 'all' ? 'bg-[#211E1A] text-[#FFFDF9]' : 'text-[#776F65] hover:bg-[#F1ECE4]'}`}
          >
            All products
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(String(category.id))}
              className={`shrink-0 rounded-full px-4 py-2 text-left text-[0.78rem] font-medium transition lg:w-full ${activeCategory === String(category.id) ? 'bg-[#211E1A] text-[#FFFDF9]' : 'text-[#776F65] hover:bg-[#F1ECE4]'}`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </aside>

      <section className="min-w-0 flex-1">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-[#E2DBD0] pb-5">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#948B7F]">Available now</p>
            <p className="mt-1 text-sm text-[#776F65]">{loading ? 'Loading dishes…' : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'dish' : 'dishes'}`}</p>
          </div>
        </div>

        {error && (
          <p className="mb-5 rounded-xl border border-[#E6C3BE] bg-[#F8E9E6] p-4 text-sm text-[#9F3A32]">
            {error}
          </p>
        )}

        {loading ? (
          <p className="py-16 text-center text-sm text-[#776F65]">Loading menu…</p>
        ) : filteredProducts.length === 0 ? (
          <p className="card p-10 text-center text-sm text-[#776F65]">
            No available products match your search or selected category.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => {
              const stock = getProductStock(product)
              const remaining = Math.max(0, stock - getCartQuantity(product.id))
              const soldOut = !product.is_available || stock <= 0

              return (
                <article
                  key={product.id}
                  className="group flex flex-col overflow-hidden rounded-[1.1rem] border border-[#E2DBD0] bg-[#FFFDF9] transition hover:border-[#D3C9BB] hover:shadow-[0_18px_40px_rgba(33,30,26,.06)]"
                >
                  <Link to={`/customer/products/${product.id}`} className="relative block h-44 overflow-hidden bg-[#EDE8DF]">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
                    ) : (
                      <div className="flex h-full items-end bg-[linear-gradient(145deg,#EDE8DF,#D8D0C3)] p-4"><span className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#776F65]">Pika-Chill</span></div>
                    )}
                    {soldOut && <span className="absolute left-3 top-3 rounded-full bg-[#211E1A]/85 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#FFFDF9]">Out of stock</span>}
                  </Link>

                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#B25F6C]">
                      {getCategoryName(product.category_id)}
                    </p>

                    <Link to={`/customer/products/${product.id}`} className="display mt-1.5 block text-lg leading-snug text-[#211E1A] transition hover:text-[#B25F6C]">{product.name}</Link>

                    <p className="mt-2 min-h-10 flex-1 text-[0.8rem] leading-5 text-[#776F65]">
                      {product.description || 'Freshly prepared to order.'}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-[#E2DBD0] pt-4">
                      <span className="text-sm font-semibold text-[#211E1A]">
                        {formatPeso(product.price)}
                      </span>

                      <button
                        type="button"
                        onClick={() => addItem(product)}
                        disabled={soldOut || remaining <= 0}
                        className="rounded-full border border-[#D3C9BB] px-3.5 py-1.5 text-[0.7rem] font-semibold text-[#211E1A] transition hover:border-[#211E1A] hover:bg-[#211E1A] hover:text-[#FFFDF9] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-[#D3C9BB] disabled:hover:bg-transparent disabled:hover:text-[#211E1A]"
                      >
                        {soldOut ? 'Out of stock' : remaining <= 0 ? 'Max in order' : 'Add to order'}
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
        </section>
      </div>
    </main>
  )
}

export default CustomerMenu
