import { Router } from 'express';
import { SupplierController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const controller = new SupplierController();

router.get('/', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), controller.findAll);
router.get('/:id', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), controller.findById);
router.post('/', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), controller.create);
router.put('/:id', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), controller.update);
router.delete('/:id', authenticate, authorize('STORE_OWNER'), controller.delete);

export default router;
