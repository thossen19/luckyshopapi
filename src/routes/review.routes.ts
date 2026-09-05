import { Router } from 'express';
import { ReviewController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const controller = new ReviewController();

router.get('/product/:productId', controller.findByProduct);
router.get('/my', authenticate, controller.findMyReviews);
router.get('/mine', authenticate, controller.findMine);
router.post('/', authenticate, controller.create);
router.put('/:id', authenticate, controller.update);
router.delete('/:id', authenticate, controller.remove);
router.patch('/:id/status', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), controller.updateStatus);
router.post('/:id/respond', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), controller.respond);

export default router;
