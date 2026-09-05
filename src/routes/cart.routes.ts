import { Router } from 'express';
import { cartController } from '../controllers/cart.controller';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', cartController.getCart);
router.post('/items', cartController.addItem);
router.put('/items/:itemId', cartController.updateItem);
router.delete('/items/:itemId', cartController.removeItem);
router.delete('/', cartController.clearCart);
router.post('/coupon', cartController.applyCoupon);

export default router;
