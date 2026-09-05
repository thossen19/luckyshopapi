import { Router } from 'express';
import { WalletController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const controller = new WalletController();

// Storefront (logged-in customer's own wallet)
router.get('/me', authenticate, controller.me);
router.get('/me/transactions', authenticate, controller.myTransactions);

// Admin / Super admin
router.get('/stats', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'), controller.getStats);
router.get('/customer/:customerId', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER', 'STAFF'), controller.getBalance);
router.get('/customer/:customerId/transactions', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER', 'STAFF'), controller.getTransactions);
router.post('/customer/:customerId/topup', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'), controller.topUp);
router.post('/customer/:customerId/adjust', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'), controller.adjust);

export default router;
