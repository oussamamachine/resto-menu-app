const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  title: { type: String, required: true }, // Original dish name (not translated)
  description: { type: String }, // Default/English description
  descriptions: {
    en: { type: String },
    fr: { type: String },
    es: { type: String },
    ar: { type: String },
    de: { type: String }
  },
  price: { type: Number, required: true },
  image: { type: String },
  category: { type: String, default: 'Main' }, // Main, Drinks, Desserts, etc.
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
