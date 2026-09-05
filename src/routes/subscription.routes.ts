import { Router } from 'express';
import { SubscriptionController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const controller = new SubscriptionController();

router.get('/plans', controller.getPlans);
router.get('/my', authenticate, controller.getMySubscription);
router.post('/subscribe', authenticate, controller.subscribe);
router.post('/cancel', authenticate, controller.cancel);
router.get('/limits', authenticate, controller.checkLimits);

export default router;
