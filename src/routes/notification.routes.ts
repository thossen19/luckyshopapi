import { Router } from 'express';
import { NotificationController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const controller = new NotificationController();

router.get('/', authenticate, controller.findAll);
router.get('/unread-count', authenticate, controller.getUnreadCount);
router.patch('/:id/read', authenticate, controller.markAsRead);
router.patch('/read-all', authenticate, controller.markAllAsRead);

export default router;
