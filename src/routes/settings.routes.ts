import { Router } from 'express';
import { StoreController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const controller = new StoreController();

router.get('/', authenticate, authorize('STORE_OWNER'), controller.findById);
router.put('/', authenticate, authorize('STORE_OWNER'), controller.updateStore);
router.put('/settings', authenticate, authorize('STORE_OWNER'), controller.updateSettings);

export default router;
