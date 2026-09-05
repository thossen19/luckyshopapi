import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticate, optionalAuth, authorize } from '../middleware/auth';

const router = Router();

// Customer orders route - must be before /:id
router.get('/my-orders', authenticate, orderController.findMyOrders);
router.post('/:id/payments', authenticate, orderController.addPayment);
router.get('/stats', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'), orderController.getStats);
router.get('/', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER', 'STAFF'), orderController.findAll);
router.get('/:id', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER', 'STAFF'), orderController.findById);
router.post('/', optionalAuth, orderController.create);
router.patch('/:id/status', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER', 'STAFF'), orderController.updateStatus);
router.post('/:id/shipments', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER', 'STAFF'), orderController.addShipment);

export default router;
