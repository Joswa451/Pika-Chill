import { Link } from 'react-router-dom'

function CustomerFooter() {
  return (
    <footer className="border-t border-[#E2DBD0] bg-[#211E1A] text-[#F1ECE4]">
      <div className="page-wrap grid gap-10 py-14 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <img src="/logo/new-logo.jpg" alt="" className="h-11 w-11 rounded-full border border-white/15 object-cover" />
            <h2 className="display text-xl">Pika-Chill</h2>
          </div>
          <p className="mt-5 max-w-xs text-sm leading-6 text-[#B7AEA2]">Freshly prepared favorites, made when you order. Reservations, delivery, outdoor seating, and takeout available.</p>
        </div>

        <section>
          <h3 className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#C6A15B]">Explore</h3>
          <div className="mt-4 grid gap-2.5 text-sm text-[#B7AEA2]">
            <Link className="transition hover:text-white" to="/customer">Home</Link>
            <Link className="transition hover:text-white" to="/customer/menu">Menu</Link>
            <Link className="transition hover:text-white" to="/customer/orders">My orders</Link>
            <Link className="transition hover:text-white" to="/customer/about">About us</Link>
          </div>
        </section>

        <section>
          <h3 className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#C6A15B]">Visit us</h3>
          <p className="mt-4 text-sm leading-6 text-[#B7AEA2]">Bo.obrero Zone 3 Everlasting Street<br />2:00 pm – 11:00 pm daily</p>
        </section>

        <section>
          <h3 className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#C6A15B]">Get in touch</h3>
          <p className="mt-4 text-sm leading-6 text-[#B7AEA2]">0912 415 2485<br />pikachill@gmail.com</p>
        </section>
      </div>

      <div className="border-t border-white/10">
        <div className="page-wrap flex flex-wrap items-center justify-between gap-2 py-5 text-[0.7rem] text-[#948B7F]">
          <p>© {new Date().getFullYear()} Pika-Chill</p>
          <p>Made fresh. Served your way.</p>
        </div>
      </div>
    </footer>
  )
}

export default CustomerFooter
