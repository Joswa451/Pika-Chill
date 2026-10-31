const supabase = require('../../config/supabase')

const listenersByCustomer = new Map()
const recentNotificationIds = new Map()

function pushNotification(notification) {
  if (!notification?.id || !notification.customer_id) return

  // The same row arrives through both the API write and Realtime subscription.
  if (recentNotificationIds.has(notification.id)) return
  recentNotificationIds.set(notification.id, Date.now())
  const cleanupTimer = setTimeout(() => recentNotificationIds.delete(notification.id), 60_000)
  cleanupTimer.unref?.()

  listenersByCustomer.get(String(notification.customer_id))?.forEach((listener) => listener(notification))
}

function addNotificationListener(customerId, listener) {
  const key = String(customerId)
  const listeners = listenersByCustomer.get(key) || new Set()
  listeners.add(listener)
  listenersByCustomer.set(key, listeners)

  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) listenersByCustomer.delete(key)
  }
}

function startNotificationRealtime() {
  supabase
    .channel('pikachill-notifications')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications'
    }, ({ new: notification }) => pushNotification(notification))
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Supabase Realtime: notifications connected')
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error(`Supabase Realtime: notifications ${status.toLowerCase()}`)
      }
    })
}

// Get notifications for one customer
async function getNotifications(customer_id) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('customer_id', customer_id)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}

// Create a notification
async function createNotification(customer_id, order_id, message) {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      customer_id,
      order_id,
      message,
      is_read: false
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  pushNotification(data)

  return data
}

// Mark only this customer's notification as read
async function markNotificationAsRead(id, customer_id) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .eq('customer_id', customer_id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

module.exports = {
  getNotifications,
  createNotification,
  markNotificationAsRead,
  addNotificationListener,
  startNotificationRealtime
}
