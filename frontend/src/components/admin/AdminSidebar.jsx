import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

function SidebarIcon({ children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px] shrink-0"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

const sections = [
  {
    label: 'Overview',
    to: '/admin',
    end: true,
    icon: (
      <SidebarIcon>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </SidebarIcon>
    )
  },
  {
    label: 'Orders',
    to: '/admin/orders',
    icon: (
      <SidebarIcon>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4V3h6v1M9 9h6M9 13h6M9 17h4" />
      </SidebarIcon>
    )
  },
  {
    label: 'Products',
    to: '/admin/products',
    icon: (
      <SidebarIcon>
        <path d="m21 8-9-5-9 5 9 5 9-5Z" />
        <path d="M3 8v8l9 5 9-5V8M12 13v8" />
      </SidebarIcon>
    )
  },
  {
    label: 'Categories',
    to: '/admin/categories',
    icon: (
      <SidebarIcon>
        <path d="m20 13-7 7-9-9V4h7l9 9Z" />
        <circle cx="8" cy="8" r="1.5" />
      </SidebarIcon>
    )
  },
  {
    label: 'Inventory',
    to: '/admin/inventory',
    icon: (
      <SidebarIcon>
        <path d="m12 3-9 5 9 5 9-5-9-5Z" />
        <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
      </SidebarIcon>
    )
  },
  {
    label: 'Customers',
    to: '/admin/customers',
    icon: (
      <SidebarIcon>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </SidebarIcon>
    )
  },
  {
    label: 'Notifications',
    to: '/admin/notifications',
    icon: (
      <SidebarIcon>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </SidebarIcon>
    )
  },
  {
    label: 'Sales / Reports',
    to: '/admin/reports',
    icon: (
      <SidebarIcon>
        <path d="M3 3v18h18" />
        <rect x="7" y="12" width="3" height="6" rx="1" />
        <rect x="12" y="8" width="3" height="10" rx="1" />
        <rect x="17" y="5" width="3" height="13" rx="1" />
      </SidebarIcon>
    )
  },
  {
    label: 'Account settings',
    to: '/admin/account',
    icon: (
      <SidebarIcon>
        <circle cx="12" cy="12" r="3" />
        <path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.8 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.8-1l-1.7.7-1.4-2.4L7.1 15a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.8-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.8 1l1.7-.7 1.4 2.4-1.4 1.1a8 8 0 0 1-.1 2Z" />
      </SidebarIcon>
    )
  }
]

function AdminSidebar({ onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  return (
    <aside className="admin-sidebar sticky top-0 z-40 w-full shrink-0 border-b border-[#3A352E] bg-[#211E1A] text-white lg:sticky lg:top-0 lg:z-auto lg:flex lg:h-screen lg:w-[264px] lg:flex-col lg:border-b-0 lg:border-r">
      <div className="flex h-[72px] items-center justify-between gap-3 border-b border-white/10 px-5 lg:h-[88px] lg:border-b-0 lg:px-6">
        <NavLink to="/admin" end className="flex min-w-0 items-center gap-3">
          <img src="/logo/new-logo.jpg" alt="Pika-Chill" className="h-10 w-10 shrink-0 rounded-full border border-white/15 object-cover" />
          <span className="min-w-0 leading-tight">
            <span className="display block truncate text-[1.05rem]">Pika-Chill</span>
            <span className="block text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-[#C6A15B]">Admin studio</span>
          </span>
        </NavLink>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="admin-mobile-menu"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 text-white transition hover:bg-white/10 lg:hidden"
        >
          {menuOpen ? (
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" /></svg>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" /></svg>
          )}
        </button>
      </div>

      <div id="admin-mobile-menu" className={`${menuOpen ? 'flex' : 'hidden'} max-h-[calc(100dvh-72px)] flex-col lg:flex lg:max-h-none lg:flex-1`}>
        <nav aria-label="Admin navigation" className="flex flex-col gap-0.5 overflow-y-auto p-3 lg:flex-1 lg:p-4">
          {sections.map(({ label, to, end, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `flex min-h-[46px] items-center gap-3 rounded-lg px-4 text-left text-[0.82rem] transition-colors ${isActive ? 'admin-nav-active font-medium text-white' : 'text-[#B7AEA2] hover:bg-white/5 hover:text-white'}`}
            >
              {({ isActive }) => <>
                <span className={isActive ? 'text-[#C6A15B]' : 'text-[#7E766B]'}>{icon}</span>
                <span className="whitespace-nowrap">{label}</span>
              </>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button type="button" onClick={() => { setMenuOpen(false); onLogout() }} className="w-full rounded-full border border-white/15 px-4 py-2.5 text-[0.78rem] text-[#F1ECE4] transition hover:bg-white/10">
            Log out
          </button>
        </div>
      </div>
    </aside>
  )
}

export default AdminSidebar
