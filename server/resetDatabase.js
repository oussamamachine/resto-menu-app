require('dotenv').config();
const mongoose = require('mongoose');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');

const resetDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/qr-menu';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected');

    // Drop all collections
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    await Order.deleteMany({});
    
    console.log('✅ Database reset complete! All collections cleared.');
    console.log('🔄 Restart the server to re-seed with new menu items.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Reset error:', error);
    process.exit(1);
  }
};

resetDatabase();
