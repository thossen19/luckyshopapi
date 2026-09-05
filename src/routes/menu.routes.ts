import { Router } from 'express';
import { menuController } from '../controllers/menu.controller';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// Public routes (for storefront)
router.get('/', asyncHandler(menuController.findAll));
router.get('/promotion-bar', asyncHandler(menuController.getPromotionBar));
router.get('/location/:location', asyncHandler(menuController.findByLocation));
router.get('/:id', asyncHandler(menuController.findById));

// Protected routes (admin) — specific routes BEFORE /:id to avoid shadowing
router.put('/promotion-bar', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER', 'SUPER_ADMIN'), asyncHandler(menuController.updatePromotionBar));
router.post('/', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER', 'SUPER_ADMIN'), asyncHandler(menuController.create));
router.put('/:id', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER', 'SUPER_ADMIN'), asyncHandler(menuController.update));
router.delete('/:id', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER', 'SUPER_ADMIN'), asyncHandler(menuController.delete));
router.post('/:menuId/items', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER', 'SUPER_ADMIN'), asyncHandler(menuController.createItem));
router.put('/items/:itemId', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER', 'SUPER_ADMIN'), asyncHandler(menuController.updateItem));
router.delete('/items/:itemId', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER', 'SUPER_ADMIN'), asyncHandler(menuController.deleteItem));

export default router;
