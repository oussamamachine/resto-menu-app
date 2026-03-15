const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Restaurant = require('../models/Restaurant');

const router = express.Router();


const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Simple admin guard middleware
function adminGuard(req, res, next) {
  const providedKey = req.query.key || req.headers['x-admin-key'] || req.body.adminKey;
  const restaurantSlug = req.query.slug || req.headers['x-restaurant-slug'] || req.body.restaurantSlug;

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

// POST /api/upload - Upload an image (admin only)
router.post('/', adminGuard, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// DELETE /api/upload/:filename - Delete an uploaded image (admin only)
router.delete('/:filename', adminGuard, (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    fs.unlinkSync(filePath);

    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router;
