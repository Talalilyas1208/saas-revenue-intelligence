import { Router } from 'express';
import authRoutes from './authRoutes.js';
import metricsRoutes from './metricsRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/metrics', metricsRoutes);

export default router;
