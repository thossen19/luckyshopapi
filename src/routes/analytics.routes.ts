import { Router } from 'express';
import { AnalyticsController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const controller = new AnalyticsController();

router.get('/sales', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), controller.getSalesReport);
router.get('/products', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), controller.getProductPerformance);
router.get('/funnel', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), controller.getConversionFunnel);
router.post('/track', controller.trackEvent);

export default router;
