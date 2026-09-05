import { Router } from 'express';
import { attributeController } from '../controllers/attribute.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public
router.get('/', attributeController.findAll);
router.get('/:id', attributeController.findById);

// Protected
router.post('/', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), attributeController.create);
router.put('/:id', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), attributeController.update);
router.delete('/:id', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), attributeController.delete);
router.post('/:id/values', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), attributeController.addValue);
router.delete('/:id/values/:valueId', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), attributeController.removeValue);

export default router;
