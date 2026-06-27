import express from 'express';
import healthRouter from './health.routes.js';
import publicationRouter from './publication.routes.js';

const router = express.Router();

// Mount API Sub-routers
router.use('/health', healthRouter);
router.use('/publications', publicationRouter);

export default router;
