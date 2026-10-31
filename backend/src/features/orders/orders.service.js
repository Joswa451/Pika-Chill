const supabase = require('../../config/supabase')

const ORDER_TYPES = new Set(['pickup', 'dine_in', 'outdoor'])

function normalizeOrderType(value) {
  const type = String(value || 'pickup').trim().toLowerCase()
  return ORDER_TYPES.has(type) ? type : 'pickup'
}

async function updateOrderType(orderId, orderType) {
  const { error } = await supabase
    .from('orders')
    .update({ order_type: orderType })
    .eq('id', orderId)

  if (error && !['PGRST204', '42703'].includes(error.code)) {
    throw error
  }
}

async function getOrderById(orderId) {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*, order_items(*, product:products(name))')
    .eq('id', orderId)
    .single()

  if (orderError) {
    throw orderError
  }

  return order
}

// Get all orders with their order items
async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, product:products(name))')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}

// Get orders belonging to one customer
async function getOrdersByCustomer(customerId) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, product:products(name))')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}

// Create order and deduct inventory
async function createOrder(customer_id, items, order_type = 'pickup') {
  const { data: orderId, error: createError } = await supabase.rpc(
    'place_order_with_inventory',
    {
      p_customer_id: customer_id,
      p_items: items
    }
  )

  if (createError) {
    throw createError
  }

  await updateOrderType(orderId, normalizeOrderType(order_type))
  return getOrderById(orderId)
}

// Create an on-the-spot order for a walk-in customer
async function createWalkInOrder(admin_id, items, order_type = 'dine_in') {
  const { data: orderId, error: createError } = await supabase.rpc(
    'place_order_with_inventory',
    {
      p_customer_id: admin_id,
      p_items: items
    }
  )

  if (createError) {
    throw createError
  }

  const { error: customerError } = await supabase
    .from('orders')
    .update({ customer_id: null })
    .eq('id', orderId)

  if (customerError) {
    throw customerError
  }

  await updateOrderType(orderId, normalizeOrderType(order_type))
  return getOrderById(orderId)
}

// Update order status or payment status
async function updateOrder(id, status, payment_status) {
  const { data: orderId, error: updateError } = await supabase.rpc(
    'update_order_with_stock',
    {
      p_order_id: id,
      p_status: status ?? null,
      p_payment_status: payment_status ?? null
    }
  )

  if (updateError) {
    throw updateError
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*, order_items(*, product:products(name))')
    .eq('id', orderId)
    .single()

  if (orderError) {
    throw orderError
  }

  return order
}

// Cancel order and restore inventory
async function deleteOrder(id) {
  const { data: orderId, error: cancelError } = await supabase.rpc(
    'update_order_with_stock',
    {
      p_order_id: id,
      p_status: 'cancelled',
      p_payment_status: null
    }
  )

  if (cancelError) {
    throw cancelError
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*, order_items(*, product:products(name))')
    .eq('id', orderId)
    .single()

  if (orderError) {
    throw orderError
  }

  return order
}

module.exports = {
  getOrders,
  getOrdersByCustomer,
  createOrder,
  createWalkInOrder,
  updateOrder,
  deleteOrder
}