import { Router } from 'express';
import { aiImageController } from '../controllers/ai-image.controller';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.post('/hunt', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER', 'STAFF'), asyncHandler(aiImageController.hunt.bind(aiImageController)));
router.post('/set', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER', 'STAFF'), asyncHandler(aiImageController.set.bind(aiImageController)));

export default router;
