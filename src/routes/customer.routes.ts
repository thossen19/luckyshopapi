import { Router } from 'express';
import { CustomerController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const controller = new CustomerController();

router.get('/', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER', 'STAFF'), controller.findAll);
router.get('/stats', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'), controller.getStats);
router.get('/segments', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'), controller.getSegments);
router.get('/:id', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER', 'STAFF'), controller.findById);
router.post('/', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'), controller.create);
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'), controller.update);
router.post('/:id/addresses', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER', 'STAFF'), controller.addAddress);

export default router;
