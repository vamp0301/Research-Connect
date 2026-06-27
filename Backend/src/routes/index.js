import express from 'express';
import healthRouter from './health.routes.js';
import authRouter from './auth.routes.js';
import profileRouter from './profile.routes.js';
import feedRouter from './feed.routes.js';

const router = express.Router();

// Mount API Sub-routers
router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/profile', profileRouter);
router.use('/feed', feedRouter);

export default router;
