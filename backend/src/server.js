import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './config/firebaseAdmin.js';

// Import routes
import templateRoutes from './routes/templateRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import apiDocsRoutes from './routes/apiDocsRoutes.js';
import customRequestRoutes from './routes/customRequestRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5177',
    'http://localhost:5174',
    'http://localhost:5175',
    'https://coupleit.web.app',
    'https://coupleit.firebaseapp.com',
    // Add your production frontend URL here
  ],
  credentials: true,
}));

// Request logging middleware (for debugging)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0 && req.path !== '/api/ai/recommend') {
    console.log(`  Body:`, JSON.stringify(req.body).substring(0, 200));
  }
  next();
});

// Increase payload size limit for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Jeeda API is running' });
});

// API Documentation (accessible at http://localhost:5000/api-docs)
app.use('/api-docs', apiDocsRoutes);

// API Routes
app.use('/api/templates', templateRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/custom-requests', customRequestRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ❌ ERROR on ${req.method} ${req.path}:`, {
    message: err.message,
    stack: err.stack,
    code: err.code,
    status: err.status,
  });
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    path: req.path,
    method: req.method,
    timestamp,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

