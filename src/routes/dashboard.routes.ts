import { Router } from 'express';
import { DashboardController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const controller = new DashboardController();

router.get('/metrics', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), controller.getMetrics);
router.get('/revenue-chart', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), controller.getRevenueChart);

export default router;
