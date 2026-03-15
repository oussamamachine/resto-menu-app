const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  title: { type: String, required: true },
  titles: {
    en: String,
    fr: String,
    es: String,
    ar: String,
    de: String
  },
  description: { type: String },
  descriptions: {
    en: String,
    fr: String,
    es: String,
    ar: String,
    de: String
  },
  price: { type: Number, required: true },
  image: { type: String },
  category: { type: String, default: 'Main' },
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
