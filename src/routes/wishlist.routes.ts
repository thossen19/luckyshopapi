import { Router } from 'express';
import { WishlistController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const controller = new WishlistController();

router.get('/', authenticate, authorize('CUSTOMER'), controller.getWishlist);
router.post('/', authenticate, authorize('CUSTOMER'), controller.addItem);
router.delete('/:productId', authenticate, authorize('CUSTOMER'), controller.removeItem);
router.get('/check/:productId', authenticate, authorize('CUSTOMER'), controller.checkItem);

export default router;
