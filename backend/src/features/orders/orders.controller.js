const {
  getOrders,
  getOrdersByCustomer,
  createOrder: createOrderService,
  createWalkInOrder: createWalkInOrderService,
  updateOrder: updateOrderService,
  deleteOrder: deleteOrderService
} = require('./orders.service')

const {
  createNotification
} = require('../notifications/notifications.service')

const {
  createSale: createSaleService
} = require('../sales/sales.service')

// Get all orders
async function getAllOrders(req, res) {
  try {
    const orders = await getOrders()
    res.status(200).json(orders)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get orders belonging to the signed-in customer
async function getMyOrders(req, res) {
  try {
    const orders = await getOrdersByCustomer(req.user.id)
    res.status(200).json(orders)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Create an order for the signed-in customer
async function createOrder(req, res) {
  try {
    const { items, order_type } = req.body
    const order = await createOrderService(req.user.id, items, order_type)

    try {
      await createNotification(req.user.id, order.id, 'We received your order. We’ll update you as it moves as it is prepared.')
    } catch (notificationError) {
      // The order and stock transaction succeeded; don't tell the customer it
      // failed and encourage them to submit a duplicate order.
      console.error('Could not create order-received notification:', notificationError.message)
    }

    res.status(201).json(order)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Create an on-the-spot order for a walk-in customer
async function createWalkInOrder(req, res) {
  try {
    const { items, order_type } = req.body
    const order = await createWalkInOrderService(req.user.id, items, order_type)
    res.status(201).json(order)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Update order and create notification or sale when applicable
async function updateOrder(req, res) {
  try {
    const { id } = req.params
    const { status, payment_status } = req.body

    if (status === undefined && payment_status === undefined) {
      return res.status(400).json({ error: 'Provide an order status or payment status to update.' })
    }

    const order = await updateOrderService(id, status, payment_status)

    let sale = null
    const warnings = []

    if (order.status === 'completed' && order.payment_status === 'paid') {
      try {
        sale = await createSaleService(order.id)
      } catch (saleError) {
        warnings.push(`Order updated, but the sale record could not be saved: ${saleError.message}`)
      }
    }

    const messageParts = []

    if (status !== undefined) {
      messageParts.push(`Order status updated to ${status}.`)
    }

    if (payment_status !== undefined) {
      messageParts.push(`Payment status updated to ${payment_status}.`)
    }

    const message = messageParts.join(' ')
    if (message) {
      try {
        await createNotification(order.customer_id, order.id, message)
      } catch (notificationError) {
        warnings.push(`Order updated, but the customer notification could not be sent: ${notificationError.message}`)
      }
    }

    res.status(200).json({
      order,
      sale,
      warning: warnings.length ? warnings.join(' ') : null
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Cancel order
async function deleteOrder(req, res) {
  try {
    const { id } = req.params
    const order = await deleteOrderService(id)

    let warning = null
    try {
      await createNotification(order.customer_id, order.id, 'Your order was cancelled. The reserved stock has been returned.')
    } catch (notificationError) {
      warning = `Order cancelled, but the customer notification could not be sent: ${notificationError.message}`
    }

    res.status(200).json({ order, warning })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  getAllOrders,
  getMyOrders,
  createOrder,
  createWalkInOrder,
  updateOrder,
  deleteOrder
}
