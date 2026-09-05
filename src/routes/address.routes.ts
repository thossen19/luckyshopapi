import { Router } from 'express';
import { AddressController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const controller = new AddressController();

// Customer's own addresses (storefront)
router.get('/', authenticate, controller.list);
router.post('/', authenticate, controller.create);
router.put('/:id', authenticate, controller.update);
router.patch('/:id/default', authenticate, controller.setDefault);
router.delete('/:id', authenticate, controller.remove);

export default router;
