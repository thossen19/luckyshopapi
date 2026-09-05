import { Router } from 'express';
import { categoryController, brandController } from '../controllers/category.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public
router.get('/', categoryController.findAll);
router.get('/slug/:slug', categoryController.findBySlug);
router.get('/:id', categoryController.findById);

// Protected
router.post('/', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'), categoryController.create);
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'), categoryController.update);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'), categoryController.delete);
router.put('/reorder', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'), categoryController.reorder);

export default router;
