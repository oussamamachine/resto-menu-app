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

const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || '*';
const corsOptions = allowedOriginsEnv === '*'
  ? { origin: '*' }
  : { origin: allowedOriginsEnv.split(',').map(o => o.trim()) };

const io = new Server(server, {
  cors: corsOptions
});

connectDB();

app.locals.io = io;
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);
app.use(bodyParser.json());

app.use('/images', express.static(path.join(__dirname, '../client/src/images')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'QR Menu & Order System API' });
});

if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDist));
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
