import { useEffect, useState } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import CustomerNavbar from '../components/customer/CustomerNavbar'
import CustomerFooter from '../components/customer/CustomerFooter'
import { useAuth } from '../features/auth/useAuth'
import { useCart } from '../features/cart/useCart'
import { getMyNotifications, streamMyNotifications } from '../features/notifications/notificationsApi'

function readProfile() {
  try { return JSON.parse(sessionStorage.getItem('profile') || 'null') } catch { return null }
}

function CustomerLayout() {
  const { logout } = useAuth()
  const { count, total } = useCart()
  const [unreadCount, setUnreadCount] = useState(0)
  const [profile, setProfile] = useState(readProfile)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    const refreshNotifications = () => {
      getMyNotifications().then((items) => {
        if (active) setUnreadCount(items.filter((item) => !item.is_read).length)
      }).catch(() => {})
    }
    const refreshProfile = () => setProfile(readProfile())
    let controller
    let retryTimer
    refreshNotifications()
    const connectToLiveNotifications = async () => {
      controller = new AbortController()
      try {
        await streamMyNotifications(() => {
          if (!active) return
          window.dispatchEvent(new Event('pikachill-notifications-updated'))
          window.dispatchEvent(new Event('pikachill-order-updated'))
        }, controller.signal)
      } catch (error) {
        if (active && error.name !== 'AbortError') {
          console.error('Live notifications disconnected:', error.message)
        }
      }
      if (active) retryTimer = window.setTimeout(connectToLiveNotifications, 3000)
    }
    connectToLiveNotifications()
    window.addEventListener('pikachill-notifications-updated', refreshNotifications)
    window.addEventListener('pikachill-profile-updated', refreshProfile)
    return () => {
      active = false
      controller?.abort()
      window.clearTimeout(retryTimer)
      window.removeEventListener('pikachill-notifications-updated', refreshNotifications)
      window.removeEventListener('pikachill-profile-updated', refreshProfile)
    }
  }, [])

  function handleLogout() {
    logout()
    navigate('/auth', { replace: true })
  }

  return (
    <div className="customer-shell flex min-h-screen flex-col bg-[#F6F3ED] text-[#211E1A]">
      <CustomerNavbar cartCount={count} cartTotal={total} unreadCount={unreadCount} profile={profile} onLogout={handleLogout} />
      <div className="flex-1"><Outlet /></div>
      <CustomerFooter />
    </div>
  )
}

export default CustomerLayout
