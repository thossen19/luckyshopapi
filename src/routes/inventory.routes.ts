import { Router } from 'express';
import { InventoryController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const controller = new InventoryController();

router.get('/stock', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER', 'STAFF'), controller.getStock);
router.post('/adjust', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), controller.adjustStock);
router.get('/transactions', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), controller.getTransactions);
router.get('/low-stock', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), controller.getLowStock);
router.get('/value', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), controller.getStockValue);

export default router;
