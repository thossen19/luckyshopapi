import { Router } from 'express';
import { customPageController } from '../controllers/custom-page.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', customPageController.findAll);
router.get('/slug/:slug', customPageController.findBySlug);
router.get('/published/:slug', customPageController.findPublishedBySlug);
router.get('/:id', customPageController.findById);
router.post('/', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER', 'SUPER_ADMIN'), customPageController.create);
router.put('/:id', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER', 'SUPER_ADMIN'), customPageController.update);
router.delete('/:id', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER', 'SUPER_ADMIN'), customPageController.delete);

export default router;
