import { Router } from 'express';
import { homepageSlideController } from '../controllers/homepage-slide.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', homepageSlideController.findAll);
router.get('/active', homepageSlideController.findActive);
router.get('/:id', homepageSlideController.findById);
router.post('/', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER', 'SUPER_ADMIN'), homepageSlideController.create);
router.put('/reorder', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER', 'SUPER_ADMIN'), homepageSlideController.reorder);
router.put('/:id', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER', 'SUPER_ADMIN'), homepageSlideController.update);
router.delete('/:id', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER', 'SUPER_ADMIN'), homepageSlideController.delete);

export default router;
