const express = require('express');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

const router = express.Router();

// Simple admin guard middleware
function adminGuard(req, res, next) {
  const providedKey = req.query.key || req.headers['x-admin-key'];
  const restaurantSlug = req.query.slug || req.headers['x-restaurant-slug'] || req.body?.restaurantSlug;

  if (!providedKey) {
    return res.status(401).json({ error: 'Admin key required' });
  }
  if (!restaurantSlug) {
    return res.status(400).json({ error: 'Restaurant slug is required' });
  }

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

router.get('/', async (req, res) => {
  try {
    const { slug } = req.query;
    const restaurant = slug
      ? await Restaurant.findOne({ slug })
      : await Restaurant.findOne();

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const items = await MenuItem.find({ restaurantId: restaurant._id, available: true })
      .sort({ category: 1, title: 1 });

    res.json(items);
  } catch (error) {
    console.error('Error reading menu items', error);
    res.status(500).json({ error: 'Failed to load menu' });
  }
});

router.post('/', adminGuard, async (req, res) => {
  try {
    const { title, description, price, category, image } = req.body;

    if (!title || !price) {
      return res.status(400).json({ error: 'Title and price are required' });
    }

    const newItem = new MenuItem({
      restaurantId: req.restaurant._id,
      title,
      description: description || '',
      price: parseFloat(price),
      category: category || 'Main',
      image: image || 'https://via.placeholder.com/400x300?text=No+Image',
      available: true
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating menu item', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

router.put('/:id', adminGuard, async (req, res) => {
  try {
    const { title, description, price, category, image } = req.body;
    const { id } = req.params;

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (category) updateData.category = category;
    if (image !== undefined) updateData.image = image;

    const item = await MenuItem.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Error updating menu item', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

router.delete('/:id', adminGuard, async (req, res) => {
  try {
    const { id } = req.params;

    const item = await MenuItem.findByIdAndDelete(id);

    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    console.error('Error deleting menu item', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

module.exports = router;
