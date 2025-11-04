# QR Menu & Order Management System

A clean, professional full-stack system for restaurants to manage orders via QR code menus.

## 🎯 Features

### For Customers

- Scan QR code to view restaurant menu
- Browse menu items with images and descriptions
- Add items to cart with quantity control
- Submit orders with name, table number, and special requests
- Clean, mobile-responsive interface

### For Restaurants

- View all incoming orders in real-time
- Mark orders as done
- Auto-refresh dashboard every 5 seconds
- Simple admin key protection
- Track active vs. completed orders

## 🛠️ Tech Stack

**Frontend:**

- React 18 + Vite
- React Router for navigation
- Axios for API calls
- TailwindCSS for styling
- Inter font

**Backend:**

- Node.js + Express
- MongoDB + Mongoose
- Socket.IO for real-time updates
- QRCode generation

## 📦 Installation

### Prerequisites

- Node.js 16+ installed
- MongoDB running (local or Atlas)

### Quick Setup

1. **Clone and Install**

```bash
git clone <repository>
cd qr-menu-demo

# Install root dependencies
npm install

# Install all dependencies (backend + frontend)
npm run install-all
```

2. **Setup MongoDB**

Create `server/.env`:

```bash
MONGO_URI=mongodb://localhost:27017/qr-menu
ADMIN_KEY=your-secret-key
CLIENT_URL=http://localhost:3000
PORT=5000
```

For MongoDB Atlas, use your connection string:

```bash
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/qr-menu
```

3. **Run Both Servers**

```bash
# From root directory
npm run dev
```

Or run separately:

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

4. **Access the Application**

- **Customer Menu**: http://localhost:3000/menu/sunrise-cafe
- **Restaurant Dashboard**: http://localhost:3000/dashboard/sunrise-cafe?key=your-secret-key

## 📁 Project Structure

```
qr-menu-demo/
├── server/
│   ├── server.js           # Express app entry point
│   ├── db.js               # MongoDB connection & seeding
│   ├── models/
│   │   ├── Restaurant.js   # Restaurant schema
│   │   ├── MenuItem.js     # Menu item schema
│   │   └── Order.js        # Order schema
│   ├── routes/
│   │   ├── restaurantRoutes.js
│   │   ├── menuRoutes.js
│   │   └── orderRoutes.js
│   ├── .env                # Environment variables
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── MenuView.jsx      # Customer menu page
│   │   │   ├── CartPage.jsx      # Shopping cart & order form
│   │   │   └── Dashboard.jsx     # Restaurant admin panel
│   │   ├── components/
│   │   │   ├── MenuItemCard.jsx  # Menu item display
│   │   │   └── OrderCard.jsx     # Order display for dashboard
│   │   ├── App.jsx               # Main app with routing & cart context
│   │   ├── main.jsx              # React entry point
│   │   └── index.css             # TailwindCSS styles
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── package.json            # Root scripts (concurrently)
└── README.md
```

## 🔌 API Endpoints

### Public Endpoints

**GET /api/restaurant?slug=:slug**

- Get restaurant info including QR code
- Response: `{ name, slug, logoUrl, qrCode }`

**GET /api/menu?slug=:slug**

- Get all menu items for a restaurant
- Response: `[{ _id, title, description, price, image, category }]`

**POST /api/orders**

- Create a new order
- Body:

```json
{
  "restaurantSlug": "sunrise-cafe",
  "customerName": "John Doe",
  "tableNumber": "5",
  "notes": "No onions",
  "items": [{ "_id": "...", "title": "Burger", "price": 12.99, "quantity": 2 }],
  "total": 25.98
}
```

### Admin Endpoints (require ?key=xxx)

**GET /api/orders?slug=:slug&key=:key**

- Get all orders for restaurant
- Optional: `&status=new|preparing|done`

**PATCH /api/orders/:id?key=:key&slug=:slug**

- Update order status
- Body: `{ "status": "done" }`

**DELETE /api/orders/:id?key=:key&slug=:slug**

- Delete/remove an order

## 🎨 Default Data

The system auto-seeds with sample data on first run:

**Restaurant:**

- Name: Sunrise Café
- Slug: sunrise-cafe
- Admin Key: changeme (from .env)

**Menu Items:**

- 21 items across 4 categories:
  - Main Dishes (8 items)
  - Appetizers (3 items)
  - Drinks (5 items)
  - Desserts (5 items)

## 🔒 Security Notes

⚠️ **This system uses simple key-based authentication for demonstration purposes.**

For production:

- Implement proper JWT authentication
- Use bcrypt for password hashing
- Add rate limiting
- Enable HTTPS
- Validate all inputs
- Add CORS restrictions

## 🚀 Deployment

### Backend (Render/Railway)

1. Push code to GitHub
2. Create new web service
3. Set environment variables:
   - `MONGO_URI`
   - `ADMIN_KEY`
   - `CLIENT_URL`
4. Deploy from main branch

### Frontend (Vercel/Netlify)

1. Import GitHub repository
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add environment variable:
   - `VITE_API_URL=https://your-backend.com`

## 🧪 Testing

**Test Customer Flow:**

1. Open menu: `http://localhost:3000/menu/sunrise-cafe`
2. Add items to cart
3. Go to cart and submit order
4. Check order appears in dashboard

**Test Dashboard:**

1. Open: `http://localhost:3000/dashboard/sunrise-cafe?key=changeme`
2. View incoming orders
3. Mark orders as done
4. Verify auto-refresh (5 seconds)

## 🛠️ Customization

### Add Your Restaurant

Edit `server/db.js` in the `seedDatabase` function:

```javascript
const restaurant = await Restaurant.create({
  name: "Your Restaurant",
  slug: "your-restaurant",
  logoUrl: "https://your-logo-url.com/logo.png",
  adminKey: process.env.ADMIN_KEY,
  qrCode: qrData,
});
```

### Add Menu Items

Edit `server/db.js` menu items array:

```javascript
{
  restaurantId: restaurant._id,
  title: 'Your Dish',
  description: 'Delicious description',
  price: 15.99,
  image: 'https://image-url.com/dish.jpg',
  category: 'Main'
}
```

### Change Colors

Edit `client/src/index.css` for button styles or `client/tailwind.config.js` for theme colors.

## 📝 Scripts Reference

**Root Directory:**

- `npm run dev` - Run both servers concurrently
- `npm run install-all` - Install all dependencies

**Backend (server/):**

- `npm run dev` - Start with nodemon (auto-restart)
- `npm start` - Start server

**Frontend (client/):**

- `npm start` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🐛 Troubleshooting

**Port already in use:**

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

**MongoDB connection error:**

- Verify MongoDB is running: `mongod --version`
- Check connection string in `.env`
- For Atlas, whitelist your IP address

**Orders not appearing:**

- Check backend console for errors
- Verify admin key matches in `.env` and URL
- Clear browser cache and localStorage

## 📄 License

MIT License - feel free to use for personal or commercial projects.

---

**Built with ❤️ for restaurant owners and developers**
