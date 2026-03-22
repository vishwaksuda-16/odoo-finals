const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Route Imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const ecoRoutes = require('./routes/ecoRoutes');
const reportRoutes = require('./routes/reportRoutes');
const bomRoutes = require('./routes/bomRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Mounting
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/ecos', ecoRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/boms', bomRoutes);
app.use('/api/settings', settingsRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.name || "Server Error",
    message: err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` API LIVE: http://localhost:${PORT}`);
});