import { Router } from 'express';
import { brandController } from '../controllers/category.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', brandController.findAll);
router.get('/:id', brandController.findById);
router.post('/', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'), brandController.create);
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'), brandController.update);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'), brandController.delete);

export default router;
