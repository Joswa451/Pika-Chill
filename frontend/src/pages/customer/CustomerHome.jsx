import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProducts } from '../../features/products/useProducts'
import { useCart } from '../../features/cart/useCart'

function formatPeso(value) {
  return `₱${(Number(value) || 0).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

const SERVICES = ['Reservations', 'In-store pickup', 'Delivery', 'Outdoor seating', 'Takeout']

const HOME_SLIDES = Array.from({ length: 7 }, (_, index) => ({
  id: `slide-${index + 1}`,
  image: `/logo/slides/slide-${index + 1}.jpg`,
  alt: `Pika-Chill highlight ${index + 1}`
}))

function CustomerHome() {
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { products, fetchProducts, loading, error } = useProducts()
  const [activeSlide, setActiveSlide] = useState(0)
  const [isCarouselPaused, setIsCarouselPaused] = useState(false)

  useEffect(() => { fetchProducts().catch(() => {}) }, [fetchProducts])

  useEffect(() => {
    if (isCarouselPaused) return undefined

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % HOME_SLIDES.length)
    }, 6000)

    return () => window.clearInterval(timer)
  }, [isCarouselPaused])

  const availableProducts = useMemo(
    () => products.filter((product) => product.is_available),
    [products]
  )
  const featuredProducts = availableProducts.slice(0, 4)

  function changeSlide(direction) {
    setActiveSlide((current) => (current + direction + HOME_SLIDES.length) % HOME_SLIDES.length)
  }

  return (
    <main>
      <section className="page-wrap pt-8 sm:pt-12">
        <div className="overflow-hidden rounded-[1.6rem] border border-[#E2DBD0] bg-[#FFFDF9] lg:grid lg:grid-cols-[1.1fr_1fr]">
          <div className="px-7 py-12 sm:px-12 lg:px-14 lg:py-16">
            <p className="eyebrow flex items-center gap-3"><span className="h-px w-8 bg-[#C6A15B]" />Pika-Chill · Fresh food</p>
            <h1 className="display mt-6 max-w-xl text-[2.9rem] text-[#211E1A] sm:text-[3.7rem] lg:text-[4.1rem]">
              Fresh food,<br /><span className="italic text-[#B25F6C]">made to order.</span>
            </h1>
            <p className="mt-6 max-w-md text-[0.95rem] leading-7 text-[#776F65]">Your favorites, freshly prepared when you order. Browse the menu, reserve a table, or choose delivery and takeout.</p>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-[0.72rem] font-medium text-[#776F65]">
              <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#2F3B33]" />Reservations</span>
              <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#C6A15B]" />Delivery &amp; takeout</span>
              <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#B25F6C]" />Outdoor seating</span>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => navigate('/customer/menu')} className="btn btn-primary">
                Explore the menu <span aria-hidden="true">→</span>
              </button>
              <button type="button" onClick={() => navigate('/customer/about')} className="btn btn-outline">
                Our story
              </button>
            </div>
          </div>

          <div
            className="relative border-t border-[#E2DBD0] lg:border-l lg:border-t-0"
            onMouseEnter={() => setIsCarouselPaused(true)}
            onMouseLeave={() => setIsCarouselPaused(false)}
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#EDE8DF] sm:aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[30rem]">
              {HOME_SLIDES.map((slide, index) => (
                <img
                  key={slide.id}
                  src={slide.image}
                  alt={slide.alt}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index === activeSlide ? 'opacity-100' : 'opacity-0'}`}
                />
              ))}

              <button
                type="button"
                onClick={() => changeSlide(-1)}
                aria-label="Previous slide"
                className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#FFFDF9]/85 text-[#211E1A] shadow-sm transition hover:bg-[#FFFDF9]"
              >
                <span aria-hidden="true">‹</span>
              </button>
              <button
                type="button"
                onClick={() => changeSlide(1)}
                aria-label="Next slide"
                className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#FFFDF9]/85 text-[#211E1A] shadow-sm transition hover:bg-[#FFFDF9]"
              >
                <span aria-hidden="true">›</span>
              </button>

              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
                {HOME_SLIDES.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={index === activeSlide ? 'true' : undefined}
                    className={`h-2 rounded-full transition-all ${index === activeSlide ? 'w-6 bg-[#FFFDF9]' : 'w-2 bg-[#FFFDF9]/60 hover:bg-[#FFFDF9]'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-wrap mt-8">
        <div className="service-marquee rounded-full border border-[#E2DBD0] bg-[#FFFDF9] py-3.5">
          <div className="service-track">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 items-center px-6" aria-hidden={copy === 1 ? 'true' : undefined}>
                {SERVICES.map((service) => (
                  <span key={service} className="flex items-center text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[#776F65]">
                    {service}
                    <span className="mx-5 h-1 w-1 rounded-full bg-[#C6A15B]" aria-hidden="true" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-wrap py-16 sm:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">Made fresh daily</p>
            <h2 className="display mt-3 text-[2.2rem] text-[#211E1A] sm:text-[2.6rem]">On the menu</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#776F65]">A small selection of favorites to start with. The full menu has plenty more.</p>
          </div>
          <button type="button" onClick={() => navigate('/customer/menu')} className="btn btn-outline btn-sm">View full menu <span aria-hidden="true">→</span></button>
        </div>

        {error && <p className="mb-6 rounded-xl border border-[#E6C3BE] bg-[#F8E9E6] p-4 text-sm text-[#9F3A32]">{error}</p>}

        {loading ? (
          <p className="py-16 text-center text-sm text-[#776F65]">Loading menu…</p>
        ) : featuredProducts.length === 0 ? (
          <p className="card p-10 text-center text-sm text-[#776F65]">No products are available right now.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <article key={product.id} className="group overflow-hidden rounded-[1.1rem] border border-[#E2DBD0] bg-[#FFFDF9] transition hover:border-[#D3C9BB] hover:shadow-[0_18px_40px_rgba(33,30,26,.06)]">
                <button type="button" onClick={() => navigate(`/customer/products/${product.id}`)} className="relative block aspect-[4/3] w-full overflow-hidden bg-[#EDE8DF] text-left">
                  {product.image_url ? <img src={product.image_url} alt={product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" /> : <div className="flex h-full items-end bg-[linear-gradient(145deg,#EDE8DF,#D8D0C3)] p-4"><span className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#776F65]">Pika-Chill</span></div>}
                </button>
                <div className="p-4">
                  <button type="button" onClick={() => navigate(`/customer/products/${product.id}`)} className="display block text-left text-lg leading-snug text-[#211E1A] transition hover:text-[#B25F6C]">{product.name}</button>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-[#211E1A]">{formatPeso(product.price)}</span>
                    <button type="button" onClick={() => addItem(product)} className="rounded-full border border-[#D3C9BB] px-3.5 py-1.5 text-[0.7rem] font-semibold text-[#211E1A] transition hover:border-[#211E1A] hover:bg-[#211E1A] hover:text-[#FFFDF9]">Add to cart</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="page-wrap pb-16 sm:pb-20">
        <div className="overflow-hidden rounded-[1.6rem] bg-[#211E1A] px-7 py-12 text-[#F1ECE4] sm:px-12 sm:py-14">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
            <div>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#C6A15B]">How it works</p>
              <h2 className="display mt-3 text-[2.1rem] sm:text-[2.6rem]">Made fresh<br /><span className="italic text-[#C6A15B]">to your hands.</span></h2>
              <p className="mt-4 max-w-sm text-sm leading-6 text-[#B7AEA2]">Order online for pickup or takeout. We prepare it fresh, and you collect it at the counter—or stay for outdoor seating.</p>
            </div>

            <div className="grid gap-8 sm:grid-cols-3 sm:gap-6">
              {[
                ['01', 'Order online', 'Browse the menu and place your order in a few taps.'],
                ['02', 'We prepare it', 'Your order is prepared fresh, then packed for pickup or takeout.'],
                ['03', 'Collect & enjoy', 'Pick it up at the counter, or settle in for outdoor seating.']
              ].map(([number, title, description]) => (
                <article key={number} className="border-t border-white/15 pt-5">
                  <span className="text-[0.62rem] font-semibold tracking-[0.18em] text-[#C6A15B]">{number}</span>
                  <h3 className="display mt-3 text-xl">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#B7AEA2]">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-wrap grid gap-4 pb-16 md:grid-cols-3 sm:pb-20">
        {[
          ['Services', 'Reservations · In-store pickup · Delivery · Outdoor seating · Takeout'],
          ['Store hours', '2:00 PM – 11:00 PM daily'],
          ['Payment', 'Cash · GCash · PayMaya · GoTyme']
        ].map(([title, description]) => (
          <article key={title} className="card p-6">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[#948B7F]">{title}</p>
            <p className="mt-3 text-sm leading-6 text-[#3D3832]">{description}</p>
          </article>
        ))}
      </section>
    </main>
  )
}

export default CustomerHome
