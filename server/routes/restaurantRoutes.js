const express = require('express');
const QRCode = require('qrcode');
const Restaurant = require('../models/Restaurant');

const router = express.Router();

// GET /api/restaurant?slug=restaurant-slug
router.get('/', async (req, res) => {
  try {
    const { slug } = req.query;
    const restaurant = slug
      ? await Restaurant.findOne({ slug })
      : await Restaurant.findOne();

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json({
      _id: restaurant._id,
      name: restaurant.name,
      slug: restaurant.slug,
      logoUrl: restaurant.logoUrl,
      qrCode: restaurant.qrCode
    });
  } catch (e) {
    console.error('Failed to load restaurant', e);
    res.status(500).json({ error: 'Failed to load restaurant' });
  }
});

// POST /api/restaurant/:id/qr - Regenerate QR code
router.post('/:id/qr', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const menuUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/menu/${restaurant.slug}`;
    const qrData = await QRCode.toDataURL(menuUrl);
    
    restaurant.qrCode = qrData;
    await restaurant.save();

    res.json({ qrCode: qrData });
  } catch (e) {
    console.error('Failed to generate QR', e);
    res.status(500).json({ error: 'Failed to generate QR' });
  }
});

// POST /api/restaurant/generate-qr - Generate QR code for any URL
router.post('/generate-qr', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const qrData = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({ qrCode: qrData });
  } catch (e) {
    console.error('Failed to generate QR', e);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// POST /api/restaurant/verify-admin - Verify admin key
router.post('/verify-admin', async (req, res) => {
  try {
    const { slug, adminKey } = req.body;
    
    if (!slug || !adminKey) {
      return res.status(400).json({ error: 'Slug and admin key are required' });
    }

    const restaurant = await Restaurant.findOne({ slug });
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    if (restaurant.adminKey === adminKey) {
      return res.json({ 
        success: true,
        restaurant: {
          _id: restaurant._id,
          name: restaurant.name,
          slug: restaurant.slug,
          logoUrl: restaurant.logoUrl
        }
      });
    } else {
      return res.status(401).json({ error: 'Invalid admin key' });
    }
  } catch (e) {
    console.error('Failed to verify admin', e);
    res.status(500).json({ error: 'Failed to verify admin key' });
  }
});

module.exports = router;
