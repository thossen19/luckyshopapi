import { Router, Request, Response } from 'express';
import { PromotionController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import { asyncHandler } from '../utils/async-handler';
import prisma from '../config/database';

const router = Router();
const controller = new PromotionController();

// Public storefront endpoint — no auth required
router.get(
  '/active',
  asyncHandler(async (req: Request, res: Response) => {
    const storeId = (req as any).storeId || (req.query.storeId as string) || undefined;
    const now = new Date();
    const where: any = { isActive: true, startDate: { lte: now }, endDate: { gte: now } };
    if (storeId) where.storeId = storeId;
    const promotions = await prisma.promotion.findMany({
      where,
      orderBy: { priority: 'desc' },
    });
    sendSuccess(res, promotions);
  })
);

router.get('/', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'), asyncHandler(controller.findAll.bind(controller)));
router.post('/', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'), asyncHandler(controller.create.bind(controller)));
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'), asyncHandler(controller.update.bind(controller)));
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'), asyncHandler(controller.delete.bind(controller)));

export default router;
