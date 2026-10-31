import { NavLink, Link } from 'react-router-dom'

function CustomerNavbar({ cartCount = 0, cartTotal = 0, unreadCount = 0, profile, onLogout }) {
  const navItems = [
    { label: 'Home', to: '/customer', end: true },
    { label: 'Menu', to: '/customer/menu' },
    { label: 'About', to: '/customer/about' },
    { label: 'My orders', to: '/customer/orders' }
  ]

  return (
    <header className="customer-header sticky top-0 z-40 border-b">
      <div className="page-wrap flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-3.5">
        <Link to="/customer" className="flex items-center gap-3" aria-label="Pika-Chill home">
          <img src="/logo/new-logo.jpg" alt="Pika-Chill" className="logo-mark" />
          <span className="display text-[1.15rem] text-[#211E1A]">Pika-Chill</span>
        </Link>

        <nav aria-label="Customer navigation" className="order-3 flex w-full items-center justify-center gap-6 border-t border-[#E2DBD0] pt-3 sm:order-2 sm:w-auto sm:gap-8 sm:border-0 sm:pt-0">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `relative py-1 text-[0.82rem] font-medium transition ${isActive ? 'text-[#211E1A]' : 'text-[#776F65] hover:text-[#211E1A]'}`}
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  <span className={`absolute -bottom-1 left-0 h-px bg-[#B25F6C] transition-all ${isActive ? 'w-full' : 'w-0'}`} />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="order-2 flex items-center gap-2.5 sm:order-3 sm:gap-3">
          <Link to="/customer/notifications" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} className="relative rounded-full border border-transparent p-2 text-[#776F65] transition hover:border-[#E2DBD0] hover:bg-[#FFFDF9] hover:text-[#211E1A]">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem]" fill="none" stroke="currentColor" strokeWidth="1.6"><path strokeLinecap="round" strokeLinejoin="round" d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
            {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#B25F6C] ring-2 ring-[#FFFDF9]" />}
          </Link>

          <Link to="/customer/cart" className="btn btn-primary btn-sm">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h15l-1.5 9h-12zM6 6 5 3H2m4 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm11 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" /></svg>
            <span>Cart</span>
            <span className="text-[#C6A15B]">₱{Number(cartTotal).toLocaleString('en-PH', { maximumFractionDigits: 2 })}</span>
            {cartCount > 0 && <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[0.65rem]">{cartCount}</span>}
          </Link>

          <Link to="/customer/profile" aria-label="Your profile" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E2DBD0] bg-[#F1ECE4] text-xs font-semibold text-[#211E1A] transition hover:border-[#B25F6C]">
            {(profile?.full_name || profile?.email || 'A').charAt(0).toUpperCase()}
          </Link>

          <button type="button" onClick={onLogout} className="hidden text-[0.72rem] font-medium text-[#948B7F] transition hover:text-[#B25F6C] sm:block">Log out</button>
        </div>
      </div>
    </header>
  )
}

export default CustomerNavbar
