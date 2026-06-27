const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const routes = require('./src/routes');
const errorHandler = require('./src/middlewares/errorHandler');
const ApiResponse = require('./src/utils/apiResponse');

const app = express();

// Security Headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging (Morgan)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// API Routes
app.use('/api/v1', routes);

// 404 Fallback
app.use((req, res) => {
  return ApiResponse.error(res, `Route not found: ${req.originalUrl}`, 404);
});

// Global Error Handler Middleware
app.use(errorHandler);

module.exports = app;
