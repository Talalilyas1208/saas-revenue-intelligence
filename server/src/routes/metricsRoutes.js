import { Router } from 'express';
import { MetricsController } from '../controllers/metricsController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/context', MetricsController.getContext);
router.post('/profile', MetricsController.updateProfile);
router.post('/organizations', MetricsController.createOrganization);
router.post('/organizations/:id/key', MetricsController.updateOrganizationKey);
router.post('/organizations/:id/sync', MetricsController.syncStripe);

router.get('/summary', MetricsController.getSummary);
router.get('/transactions', MetricsController.getTransactions);
router.post('/transactions', MetricsController.recordTransaction);
router.get('/customers', MetricsController.getCustomers);
router.post('/customers', MetricsController.createCustomer);
router.patch('/customers/:id', MetricsController.updateCustomerStatus);

router.post('/license/verify', MetricsController.verifyLicense);

export default router;
