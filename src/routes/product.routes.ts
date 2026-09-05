import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { authenticate, optionalAuth, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// Public routes
router.get('/featured', asyncHandler(productController.getFeatured));
router.get('/new-arrivals', asyncHandler(productController.getNewArrivals));
router.get('/best-sellers', asyncHandler(productController.getBestSellers));
router.get('/search', asyncHandler(productController.search));
router.get('/slug/:slug', asyncHandler(productController.findBySlug));
router.get('/options', asyncHandler(productController.getOptions));
router.get('/', asyncHandler(productController.findAll));
router.get('/:id', asyncHandler(productController.findById));

// Protected routes
router.post('/', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER', 'STAFF'), asyncHandler(productController.create));
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER', 'STAFF'), asyncHandler(productController.update));
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'), asyncHandler(productController.delete));
router.post('/:id/images', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER', 'STAFF'), asyncHandler(productController.addImage));
router.delete('/:id/images/:imageId', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER', 'STAFF'), asyncHandler(productController.deleteImage));

export default router;
