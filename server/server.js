require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./db');

const app = express();
const server = http.createServer(app);

// Configure allowed origins for both REST and Socket.io
const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || '*';
const corsOptions = allowedOriginsEnv === '*'
  ? { origin: '*' }
  : { origin: allowedOriginsEnv.split(',').map(o => o.trim()) };

const io = new Server(server, {
  cors: corsOptions
});

// Connect to MongoDB
connectDB();

// Make io available to routes via app locals
app.locals.io = io;

// Middleware
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Basic rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);
app.use(bodyParser.json());

// Serve static images from client/src/images
app.use('/images', express.static(path.join(__dirname, '../client/src/images')));

// Serve uploaded images from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'QR Menu & Order System API' });
});

// In production, serve the client build as static files
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDist));
  // SPA fallback
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
