const express = require('express');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');

const router = express.Router();

// Simple admin guard middleware using query param ?key=xxx
function adminGuard(req, res, next) {
  const providedKey = req.query.key || req.headers['x-admin-key'];
  const restaurantSlug = req.query.slug;

  if (!providedKey) {
    return res.status(401).json({ error: 'Admin key required' });
  }

  // Verify key against restaurant
  Restaurant.findOne({ slug: restaurantSlug })
    .then(restaurant => {
      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }
      if (restaurant.adminKey !== providedKey) {
        return res.status(401).json({ error: 'Invalid admin key' });
      }
      req.restaurant = restaurant;
      next();
    })
  .catch(() => res.status(500).json({ error: 'Server error' }));
}

// GET /api/orders?slug=restaurant-slug&key=xxx&status=new (admin only)
router.get('/', adminGuard, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { restaurantId: req.restaurant._id };
    
    if (status && ['new', 'preparing', 'done'].includes(status)) {
      query.status = status;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (e) {
    console.error('Failed to read orders', e);
    res.status(500).json({ error: 'Failed to load orders' });
  }
});

// POST /api/orders - Create new order
router.post('/', async (req, res) => {
  const { restaurantSlug, customerName, tableNumber, notes, items, total } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must include items' });
  }

  try {
    const restaurant = await Restaurant.findOne({ slug: restaurantSlug });
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const newOrder = new Order({
      restaurantId: restaurant._id,
      customerName: customerName || 'Guest',
      tableNumber: tableNumber || 'N/A',
      notes: notes || '',
      items: items.map(i => ({
        menuItemId: i._id || i.id,
        title: i.title,
        price: i.price,
        quantity: i.quantity
      })),
      total: total || items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      status: 'new'
    });

    await newOrder.save();

    // Emit socket event
    try {
      req.app.locals.io.emit('ordersUpdated', { restaurantSlug });
    } catch (e) {
      console.error('Socket emit error:', e);
    }

    res.status(201).json(newOrder);
  } catch (e) {
    console.error('Failed to create order', e);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PATCH /api/orders/:id?key=xxx&slug=xxx - Update order status (admin only)
router.patch('/:id', adminGuard, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['new', 'preparing', 'done'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, restaurantId: req.restaurant._id },
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    try {
      req.app.locals.io.emit('ordersUpdated', { restaurantSlug: req.restaurant.slug });
    } catch (e) {
      console.error('Socket emit error:', e);
    }

    res.json(order);
  } catch (e) {
    console.error('Failed to update order', e);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// DELETE /api/orders/:id?key=xxx&slug=xxx (admin only)
router.delete('/:id', adminGuard, async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({
      _id: req.params.id,
      restaurantId: req.restaurant._id
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    try {
      req.app.locals.io.emit('ordersUpdated', { restaurantSlug: req.restaurant.slug });
    } catch (e) {
      console.error('Socket emit error:', e);
    }

    res.json({ success: true });
  } catch (e) {
    console.error('Failed to delete order', e);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

module.exports = router;
