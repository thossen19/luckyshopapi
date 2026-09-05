import { Router } from 'express';
import { PurchaseController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const controller = new PurchaseController();

router.get('/', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), controller.findAll);
router.get('/:id', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), controller.findById);
router.post('/', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), controller.create);
router.post('/:id/receive', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), controller.receive);

export default router;
