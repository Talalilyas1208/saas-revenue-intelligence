import { Router } from 'express';
import metricsRoutes from './metricsRoutes.js';

const router = Router();

router.use('/metrics', metricsRoutes);

export default router;
