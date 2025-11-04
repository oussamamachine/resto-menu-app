const mongoose = require('mongoose');
const QRCode = require('qrcode');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/qr-menu';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected');

    // Seed initial data if empty
    await seedDatabase();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    const restaurantCount = await Restaurant.countDocuments();
    if (restaurantCount === 0) {
      const qrData = await QRCode.toDataURL('http://localhost:3000/menu/sunrise-cafe');
      const restaurant = await Restaurant.create({
        name: 'Sunrise Café',
        slug: 'sunrise-cafe',
        logoUrl: 'https://img.logoipsum.com/243.svg',
        adminKey: process.env.ADMIN_KEY || 'changeme',
        qrCode: qrData
      });

      // Professional Menu Items with High-Quality Images
      const menuItems = [
        // === SIGNATURE DISHES ===
        {
          restaurantId: restaurant._id,
          title: 'Wagyu Beef Burger',
          description: 'Premium Wagyu beef patty, truffle aioli, caramelized onions, aged cheddar, arugula on brioche bun.',
          price: 18.99,
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
          category: 'Main'
        },
        {
          restaurantId: restaurant._id,
          title: 'Neapolitan Margherita Pizza',
          description: 'Wood-fired pizza with San Marzano tomatoes, buffalo mozzarella, fresh basil, EVOO.',
          price: 16.99,
          image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800&q=80',
          category: 'Main'
        },
        {
          restaurantId: restaurant._id,
          title: 'Grilled Atlantic Salmon',
          description: 'Fresh Atlantic salmon with lemon butter, asparagus, roasted potatoes, dill cream sauce.',
          price: 22.99,
          image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80',
          category: 'Main'
        },
        {
          restaurantId: restaurant._id,
          title: 'Truffle Mushroom Risotto',
          description: 'Creamy arborio rice with porcini mushrooms, white truffle oil, parmesan, fresh herbs.',
          price: 19.99,
          image: 'https://images.unsplash.com/photo-1476124369491-c4cd74d3ff10?w=800&q=80',
          category: 'Main'
        },
        {
          restaurantId: restaurant._id,
          title: 'Prime Ribeye Steak',
          description: '12oz USDA Prime ribeye, herb butter, garlic mashed potatoes, grilled vegetables.',
          price: 32.99,
          image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80',
          category: 'Main'
        },
        {
          restaurantId: restaurant._id,
          title: 'Lobster Linguine',
          description: 'Fresh lobster tail, garlic white wine sauce, cherry tomatoes, basil, parmesan.',
          price: 28.99,
          image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
          category: 'Main'
        },
        {
          restaurantId: restaurant._id,
          title: 'Pan-Seared Duck Breast',
          description: 'Tender duck breast, cherry reduction, roasted root vegetables, crispy skin.',
          price: 26.99,
          image: 'https://images.unsplash.com/photo-1604908815969-23b25e1aa728?w=800&q=80',
          category: 'Main'
        },
        {
          restaurantId: restaurant._id,
          title: 'Sushi Platter Deluxe',
          description: 'Chef selection: 8 pieces nigiri, 6 pieces sashimi, California roll, wasabi, ginger.',
          price: 24.99,
          image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80',
          category: 'Main'
        },

        // === APPETIZERS ===
        {
          restaurantId: restaurant._id,
          title: 'Crispy Calamari',
          description: 'Lightly fried calamari rings, marinara sauce, lemon aioli, fresh herbs.',
          price: 12.99,
          image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80',
          category: 'Appetizers'
        },
        {
          restaurantId: restaurant._id,
          title: 'Bruschetta Trio',
          description: 'Toasted crostini with tomato basil, mushroom truffle, and prosciutto toppings.',
          price: 10.99,
          image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=800&q=80',
          category: 'Appetizers'
        },
        {
          restaurantId: restaurant._id,
          title: 'Shrimp Tempura',
          description: 'Crispy tempura shrimp, sweet chili sauce, pickled vegetables.',
          price: 13.99,
          image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80',
          category: 'Appetizers'
        },
        {
          restaurantId: restaurant._id,
          title: 'Caprese Salad',
          description: 'Fresh mozzarella, heirloom tomatoes, basil, balsamic glaze, EVOO.',
          price: 11.99,
          image: 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=800&q=80',
          category: 'Appetizers'
        },
        {
          restaurantId: restaurant._id,
          title: 'French Onion Soup',
          description: 'Caramelized onions, beef broth, gruyere cheese, crusty bread.',
          price: 8.99,
          image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80',
          category: 'Appetizers'
        },

        // === PREMIUM DRINKS ===
        {
          restaurantId: restaurant._id,
          title: 'Fresh Pressed Juices',
          description: 'Daily selection of cold-pressed organic juices: orange, carrot, green detox.',
          price: 6.99,
          image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&q=80',
          category: 'Drinks'
        },
        {
          restaurantId: restaurant._id,
          title: 'Specialty Coffee',
          description: 'Espresso, cappuccino, latte, or flat white with premium arabica beans.',
          price: 4.99,
          image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
          category: 'Drinks'
        },
        {
          restaurantId: restaurant._id,
          title: 'Tropical Smoothie Bowl',
          description: 'Mango, pineapple, banana, coconut milk, topped with granola and berries.',
          price: 8.99,
          image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&q=80',
          category: 'Drinks'
        },
        {
          restaurantId: restaurant._id,
          title: 'Artisan Iced Tea',
          description: 'House-brewed iced tea: peach, passion fruit, or green tea with mint.',
          price: 4.49,
          image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80',
          category: 'Drinks'
        },
        {
          restaurantId: restaurant._id,
          title: 'Classic Milkshake',
          description: 'Vanilla, chocolate, or strawberry with whipped cream and cherry.',
          price: 6.49,
          image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80',
          category: 'Drinks'
        },

        // === DESSERTS ===
        {
          restaurantId: restaurant._id,
          title: 'Molten Chocolate Lava Cake',
          description: 'Warm chocolate cake with liquid center, vanilla ice cream, raspberry coulis.',
          price: 9.99,
          image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80',
          category: 'Desserts'
        },
        {
          restaurantId: restaurant._id,
          title: 'Classic Crème Brûlée',
          description: 'Silky vanilla custard with caramelized sugar crust, fresh berries.',
          price: 8.99,
          image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=800&q=80',
          category: 'Desserts'
        },
        {
          restaurantId: restaurant._id,
          title: 'New York Cheesecake',
          description: 'Creamy cheesecake, graham cracker crust, mixed berry compote.',
          price: 8.49,
          image: 'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=800&q=80',
          category: 'Desserts'
        },
        {
          restaurantId: restaurant._id,
          title: 'Tiramisu',
          description: 'Classic Italian dessert with espresso-soaked ladyfingers, mascarpone, cocoa.',
          price: 8.99,
          image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80',
          category: 'Desserts'
        },
        {
          restaurantId: restaurant._id,
          title: 'Profiteroles',
          description: 'Choux pastry puffs filled with vanilla cream, chocolate ganache.',
          price: 9.49,
          image: 'https://images.unsplash.com/photo-1612201142855-9d974ab6b7e1?w=800&q=80',
          category: 'Desserts'
        },
        {
          restaurantId: restaurant._id,
          title: 'Artisan Gelato Trio',
          description: 'Three scoops: pistachio, stracciatella, and salted caramel.',
          price: 7.99,
          image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80',
          category: 'Desserts'
        }
      ];

      await MenuItem.insertMany(menuItems);
      console.log('✅ Database seeded with restaurant and menu items');
    }
  } catch (error) {
    console.error('❌ Seeding error:', error);
  }
};

module.exports = connectDB;
