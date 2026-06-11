const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');

// Route imports
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const segmentRoutes = require('./routes/segmentRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const receiptRoutes = require('./routes/receiptRoutes');
const aiRoutes = require('./routes/aiRoutes');
const { initGemini } = require('./services/geminiService');

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize Gemini AI
initGemini();

// --- Health Check ---
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'xeno-pulse-crm', timestamp: new Date().toISOString() });
});

// --- API Routes ---
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/segments', segmentRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/receipt', receiptRoutes);

app.use('/api/ai', aiRoutes);

// --- 404 Handler ---
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` });
});

// --- Global Error Handler ---
app.use(errorHandler);

module.exports = app;
