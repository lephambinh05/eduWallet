const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Import routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// API endpoint to get partner configuration
app.get('/config', (req, res) => {
  res.json({
    partnerId: process.env.PARTNER_ID,
    partnerName: process.env.PARTNER_NAME,
    jwtToken: process.env.PARTNER_JWT_TOKEN,
    apiKey: process.env.PARTNER_API_KEY,
    backendUrl: process.env.BACKEND_URL || 'http://localhost:3001'
  });
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Partner Website 2 (Quiz) running on http://localhost:${PORT}`);
  console.log(`Partner ID: ${process.env.PARTNER_ID}`);
});

module.exports = app;
