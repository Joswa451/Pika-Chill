import { useEffect, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'

function CustomerNavbar({ cartCount = 0, cartTotal = 0, unreadCount = 0, profile, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const navItems = [
    { label: 'Home', to: '/customer', end: true },
    { label: 'Menu', to: '/customer/menu' },
    { label: 'About', to: '/customer/about' },
    { label: 'My orders', to: '/customer/orders' }
  ]

  useEffect(() => {
    if (!menuOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  return (
    <header className="customer-header sticky top-0 z-40 border-b">
      <div className="page-wrap flex items-center justify-between gap-3 py-3 sm:py-3.5">
        <Link to="/customer" className="flex min-w-0 items-center gap-2.5 sm:gap-3" aria-label="Pika-Chill home">
          <img src="/logo/new-logo.jpg" alt="Pika-Chill" className="logo-mark h-9 w-9 sm:h-[2.6rem] sm:w-[2.6rem]" />
          <span className="display truncate text-[1.05rem] text-[#211E1A] sm:text-[1.15rem]">Pika-Chill</span>
        </Link>

        <nav aria-label="Customer navigation" className="hidden items-center gap-8 lg:flex">
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

        <div className="flex shrink-0 items-center gap-1 sm:gap-2.5 lg:gap-3">
          <Link to="/customer/notifications" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} className="relative rounded-full border border-transparent p-2 text-[#776F65] transition hover:border-[#E2DBD0] hover:bg-[#FFFDF9] hover:text-[#211E1A]">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem]" fill="none" stroke="currentColor" strokeWidth="1.6"><path strokeLinecap="round" strokeLinejoin="round" d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
            {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#B25F6C] ring-2 ring-[#FFFDF9]" />}
          </Link>

          <Link to="/customer/cart" aria-label={`Cart with ${cartCount} ${cartCount === 1 ? 'item' : 'items'}, total ₱${Number(cartTotal).toLocaleString('en-PH', { maximumFractionDigits: 2 })}`} className="btn btn-primary btn-sm px-3 sm:px-4">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h15l-1.5 9h-12zM6 6 5 3H2m4 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm11 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" /></svg>
            <span className="hidden sm:inline">Cart</span>
            <span className="hidden text-[#C6A15B] sm:inline">₱{Number(cartTotal).toLocaleString('en-PH', { maximumFractionDigits: 2 })}</span>
            {cartCount > 0 && <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[0.65rem]">{cartCount}</span>}
          </Link>

          <Link to="/customer/profile" aria-label="Your profile" className="hidden h-9 w-9 items-center justify-center rounded-full border border-[#E2DBD0] bg-[#F1ECE4] text-xs font-semibold text-[#211E1A] transition hover:border-[#B25F6C] sm:flex">
            {(profile?.full_name || profile?.email || 'A').charAt(0).toUpperCase()}
          </Link>

          <button type="button" onClick={onLogout} className="hidden text-[0.72rem] font-medium text-[#948B7F] transition hover:text-[#B25F6C] lg:block">Log out</button>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="customer-mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E2DBD0] text-[#211E1A] transition hover:border-[#B25F6C] lg:hidden"
          >
            {menuOpen ? (
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem]" fill="none" stroke="currentColor" strokeWidth="1.6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" /></svg>
            ) : (
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem]" fill="none" stroke="currentColor" strokeWidth="1.6"><path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="customer-mobile-menu" className="border-t border-[#E2DBD0] bg-[#FFFDF9] lg:hidden">
          <nav aria-label="Customer mobile navigation" className="page-wrap grid gap-1 py-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => `rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-[#211E1A] text-[#FFFDF9]' : 'text-[#776F65] hover:bg-[#F1ECE4] hover:text-[#211E1A]'}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="page-wrap flex items-center justify-between gap-3 border-t border-[#E2DBD0] py-3">
            <Link to="/customer/profile" onClick={() => setMenuOpen(false)} className="flex min-w-0 items-center gap-2 text-sm font-medium text-[#211E1A]">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E2DBD0] bg-[#F1ECE4] text-xs font-semibold">
                {(profile?.full_name || profile?.email || 'A').charAt(0).toUpperCase()}
              </span>
              <span className="truncate">{profile?.full_name || 'My profile'}</span>
            </Link>
            <button type="button" onClick={() => { setMenuOpen(false); onLogout() }} className="shrink-0 text-[0.78rem] font-semibold text-[#B25F6C]">Log out</button>
          </div>
        </div>
      )}
    </header>
  )
}

export default CustomerNavbar
