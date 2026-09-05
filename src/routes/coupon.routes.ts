import { Router } from 'express';
import { CouponController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const controller = new CouponController();

router.get('/', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), controller.findAll);
router.post('/', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), controller.create);
router.put('/:id', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), controller.update);
router.delete('/:id', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), controller.delete);
router.post('/validate', controller.validate);

export default router;
