import { Router } from 'express';
import { MetricsController } from '../controllers/metricsController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// Apply auth middleware
router.use(authMiddleware);

router.get('/summary', MetricsController.getSummary);
router.get('/transactions', MetricsController.getTransactions);
router.get('/customers', MetricsController.getCustomers);
router.post('/simulate', MetricsController.simulateTransaction);

export default router;
