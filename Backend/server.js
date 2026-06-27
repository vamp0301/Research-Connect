require('dotenv').config();
const app = require('./app');
const connectDB = require('./src/config/db');
const validateEnv = require('./src/config/env');
const logger = require('./src/utils/logger');

// Validate environment variables on startup
validateEnv();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then start listener
connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}).catch((err) => {
  logger.error(`Database connection failed: ${err.message}`);
  process.exit(1);
});
