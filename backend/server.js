const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Helps with some ISP connection issues to MongoDB Atlas


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();


// Suppress swagger-jsdoc deprecation warnings
const originalEmitWarning = process.emitWarning;
process.emitWarning = (warning, type, ...args) => {
  if (type === 'DeprecationWarning' && String(warning).includes('url.parse')) return;
  originalEmitWarning.call(process, warning, type, ...args);
};


const app = express();


// ====================== MIDDLEWARES ======================
// Configure CORS properly to allow your React app (localhost:3000)
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
}));


app.use(express.json()); // Essential to read req.body


// ====================== SWAGGER CONFIG ======================
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DocTrack API Documentation',
      version: '1.0.0',
      description: 'API for National University Document Request System',
    },
    servers: [{ url: 'http://localhost:5000', description: 'Development server' }],
  },
  // Make sure this path matches your folder structure!
  apis: ['./controllers/*.js', './routes/*.js'],
};


const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


// ====================== DATABASE ======================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ SUCCESS: Database Connected!'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });


// ====================== ROUTES ======================


// Health Check Route (To verify the server is up)
app.get('/health', (req, res) => res.send('API is running...'));


// Auth Routes (Login/Register)
app.use('/api/auth', require('./routes/authRoutes'));


app.use('/api/requests', require('./routes/docRoutes'));


// ====================== GLOBAL ERROR HANDLER ======================
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong on the server!' });
});


// ====================== SERVER ======================
const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log('-----------------------------------------');
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📖 Docs:   http://localhost:${PORT}/api-docs`);
  console.log('-----------------------------------------');
});


// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down server...');
  mongoose.connection.close();
  process.exit(0);
});
