import { useCallback, useEffect, useState } from 'react'
import { getMyNotifications, markNotificationAsRead } from '../../features/notifications/notificationsApi'

function CustomerNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setNotifications(await getMyNotifications()) } catch (err) { setError(err.message) } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    Promise.resolve().then(load)
    window.addEventListener('pikachill-notifications-updated', load)

    return () => {
      window.removeEventListener('pikachill-notifications-updated', load)
    }
  }, [load])

  async function markRead(id) {
    try {
      const updated = await markNotificationAsRead(id)
      setNotifications((previous) => previous.map((item) => item.id === id ? updated : item))
      window.dispatchEvent(new Event('pikachill-notifications-updated'))
    } catch (err) { setError(err.message) }
  }

  return (
    <main className="page-wrap min-h-[60vh] py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-[#E2DBD0] pb-6">
        <div>
          <p className="eyebrow">Updates</p>
          <h1 className="display mt-3 text-[2.6rem] text-[#211E1A]">Notifications</h1>
          <p className="mt-3 text-sm text-[#776F65]">Order updates from Pika-Chill.</p>
        </div>
        <button onClick={load} disabled={loading} className="btn btn-outline btn-sm">{loading ? 'Refreshing…' : 'Refresh'}</button>
      </div>

      {error && <p role="alert" className="mt-5 rounded-xl border border-[#E6C3BE] bg-[#F8E9E6] p-4 text-sm text-[#9F3A32]">{error}</p>}

      {loading ? (
        <p className="py-16 text-center text-sm text-[#776F65]">Loading notifications…</p>
      ) : notifications.length === 0 ? (
        <section className="card mt-7 p-10 text-center text-sm text-[#776F65]">You don’t have any notifications yet.</section>
      ) : (
        <section className="table-shell mt-7">
          {notifications.map((item) => (
            <article key={item.id} className={`flex flex-wrap items-start justify-between gap-3 border-b border-[#E2DBD0] p-5 last:border-0 ${item.is_read ? '' : 'bg-[#FBF8F3]'}`}>
              <div>
                <p className={`text-sm ${item.is_read ? 'text-[#776F65]' : 'font-medium text-[#211E1A]'}`}>{item.message || 'There’s an update on your order.'}</p>
                <p className="mt-1.5 text-[0.7rem] text-[#948B7F]">{item.created_at ? new Date(item.created_at).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }) : ''}</p>
              </div>
              {!item.is_read && <button onClick={() => markRead(item.id)} className="text-[0.72rem] font-semibold text-[#B25F6C] hover:underline">Mark as read</button>}
            </article>
          ))}
        </section>
      )}
    </main>
  )
}

export default CustomerNotifications
