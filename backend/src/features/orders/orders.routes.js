const express = require('express')
const router = express.Router()

const requireAuth = require('../../middleware/auth.middleware')
const requireAdmin = require('../../middleware/role.middleware')

const {
  getAllOrders,
  getMyOrders,
  createOrder,
  createWalkInOrder,
  updateOrder,
  deleteOrder
} = require('./orders.controller')

// Customer routes
router.get('/mine', requireAuth, getMyOrders)
router.post('/', requireAuth, createOrder)

// Admin routes
router.post('/walk-in', requireAuth, requireAdmin, createWalkInOrder)
router.get('/', requireAuth, requireAdmin, getAllOrders)
router.put('/:id', requireAuth, requireAdmin, updateOrder)
router.delete('/:id', requireAuth, requireAdmin, deleteOrder)

module.exports = router