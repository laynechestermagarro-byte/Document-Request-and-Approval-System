const dns = require('dns');

// Force reliable DNS servers (Fix for querySrv ECONNREFUSED)
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

// Suppress only the swagger-jsdoc url.parse deprecation warning
const originalEmitWarning = process.emitWarning;
process.emitWarning = (warning, type, ...args) => {
  if (type === 'DeprecationWarning' && String(warning).includes('url.parse')) {
    return;
  }
  originalEmitWarning.call(process, warning, type, ...args);
};

const app = express();

// ====================== MIDDLEWARES ======================
app.use(cors());
app.use(express.json());

// ====================== SWAGGER CONFIGURATION ======================
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DocTrack API Documentation',
      version: '1.0.0',
      description: 'API for National University Document Request System',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ====================== DATABASE CONNECTION ======================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ SUCCESS: Database Connected!'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// ====================== ROUTES ======================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/docs', require('./routes/requestRoutes'));

// ====================== SERVER ======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 API is running on port ${PORT}`);
  console.log(`📖 Swagger Docs: http://localhost:5000/api-docs`);
  console.log('✅ Server started successfully!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Closing server...');
  mongoose.connection.close();
  process.exit(0);
});