import { Router } from 'express';
import { AiController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const controller = new AiController();

router.post('/generate-description', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), controller.generateProductDescription);
router.post('/generate-seo', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), controller.generateSeoContent);
router.post('/generate-product-content', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER', 'STAFF'), controller.generateProductContent);
router.post('/chat', authenticate, controller.chatAssistant);
router.get('/insights', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), controller.getInsights);

export default router;
