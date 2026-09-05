import { Router } from 'express';
import { CampaignController } from '../controllers/campaign.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const controller = new CampaignController();

router.get('/', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'), controller.findAll);
router.get('/:id', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'), controller.findById);
router.post('/', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'), controller.create);
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'), controller.update);
router.patch('/:id/status', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'), controller.updateStatus);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'), controller.delete);

export default router;
