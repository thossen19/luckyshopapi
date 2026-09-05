import { Router } from 'express';
import { StoreController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const controller = new StoreController();

// Public routes - specific routes BEFORE /:id to avoid shadowing
router.get('/slug/:slug', controller.findBySlug);
router.get('/branding/:slug', controller.getBranding);
router.get('/storefront/:slug', controller.getStorefront);
router.get('/:id', controller.findById);

// Protected routes
router.post('/', authenticate, controller.createStorefront);
router.put('/:id', authenticate, authorize('STORE_OWNER', 'SUPER_ADMIN'), controller.updateStore);
router.put('/:id/settings', authenticate, authorize('STORE_OWNER', 'SUPER_ADMIN'), controller.updateSettings);
router.get('/', authenticate, authorize('SUPER_ADMIN'), controller.getAllStores);

export default router;
