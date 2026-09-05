import { Router } from 'express';
import { LoyaltyController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const controller = new LoyaltyController();

router.get('/customer/:customerId/balance', authenticate, controller.getBalance);
router.get('/customer/:customerId/history', authenticate, controller.getHistory);
router.post('/customer/:customerId/earn', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), controller.earnPoints);
router.post('/customer/:customerId/redeem', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), controller.redeemPoints);

export default router;
