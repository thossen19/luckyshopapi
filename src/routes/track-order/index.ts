import { Router } from 'express';
import prisma from '../../config/database';
import { sendSuccess, sendError } from '../../utils/response';

const router = Router();

// GET /api/v1/track-order?order_number=xxx
router.get('/', async (req, res) => {
  const orderNumber = (req.query.order_number as string || '').trim();

  if (!orderNumber) {
    return sendError(res, 'Order number is required', 400);
  }

  try {
    const order = await prisma.order.findFirst({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1, orderBy: { sortOrder: 'asc' } },
              },
            },
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!order) {
      return sendError(res, 'Order not found. Please check your order number.', 404);
    }

    sendSuccess(res, order);
  } catch (error) {
    console.error('Track order error:', error);
    sendError(res, 'Failed to fetch order details', 500);
  }
});

export default router;
