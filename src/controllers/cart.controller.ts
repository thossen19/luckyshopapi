import { Response } from 'express';
import { cartService } from '../services/cart.service';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';

export class CartController {
  async getCart(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user?.storeId || req.query.storeId as string;
    const customerId = req.user?.id;
    const sessionId = req.headers['x-session-id'] as string;
    const cart = await cartService.getCart(storeId, customerId, sessionId);
    sendSuccess(res, cart);
  }

  async addItem(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user?.storeId || req.body.storeId;
    const customerId = req.user?.role === 'CUSTOMER' ? req.user.id : undefined;
    const sessionId = req.headers['x-session-id'] as string;
    const item = await cartService.addItem(storeId, { ...req.body, customerId, sessionId });
    sendSuccess(res, item, 'Item added to cart', 201);
  }

  async updateItem(req: AuthRequest, res: Response) {
    const item = await cartService.updateItem(
      (req as any).storeId || req.user!.storeId!,
      req.params.itemId,
      req.body.quantity,
      req.user?.id
    );
    sendSuccess(res, item, 'Cart updated');
  }

  async removeItem(req: AuthRequest, res: Response) {
    await cartService.removeItem((req as any).storeId || req.user!.storeId!, req.params.itemId);
    sendSuccess(res, null, 'Item removed');
  }

  async clearCart(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const customerId = req.user?.id;
    const sessionId = req.headers['x-session-id'] as string;
    await cartService.clearCart(storeId!, customerId, sessionId);
    sendSuccess(res, null, 'Cart cleared');
  }

  async applyCoupon(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const customerId = req.user?.id;
    const sessionId = req.headers['x-session-id'] as string;
    const result = await cartService.applyCoupon(storeId!, req.body.code, customerId, sessionId);
    sendSuccess(res, result, 'Coupon applied');
  }
}

export const cartController = new CartController();
