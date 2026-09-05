import { Response } from 'express';
import { paymentMethodService } from '../services/payment-method.service';
import { AuthRequest } from '../types';
import { sendSuccess, sendPaginated } from '../utils/response';

export class PaymentMethodController {
  async findAll(req: AuthRequest, res: Response) {
    const user = req.user!;
    let storeId = user.storeId || (req as any).storeId;
    
    // SUPER_ADMIN can pass storeId as query param
    const queryStoreId = req.query.storeId as string;
    if (user.role === 'SUPER_ADMIN' && queryStoreId) {
      storeId = queryStoreId;
    }
    
    if (!storeId) return sendSuccess(res, []);
    const data = await paymentMethodService.findAll(storeId);
    sendSuccess(res, data);
  }

  async findById(req: AuthRequest, res: Response) {
    const storeId = req.user!.storeId || (req as any).storeId;
    const data = await paymentMethodService.findById(storeId!, req.params.id);
    sendSuccess(res, data);
  }

  async create(req: AuthRequest, res: Response) {
    const user = req.user!;
    let storeId = user.storeId || (req as any).storeId;
    
    // SUPER_ADMIN can pass storeId as query param or body
    const queryStoreId = req.query.storeId as string;
    const bodyStoreId = req.body.storeId as string;
    if (user.role === 'SUPER_ADMIN') {
      storeId = queryStoreId || bodyStoreId || storeId;
    }
    
    if (!storeId) {
      return res.status(400).json({ success: false, message: 'Store ID is required' });
    }
    
    const data = await paymentMethodService.create(storeId, req.body);
    sendSuccess(res, data, 'Payment method created', 201);
  }

  async update(req: AuthRequest, res: Response) {
    const storeId = req.user!.storeId || (req as any).storeId;
    const data = await paymentMethodService.update(storeId!, req.params.id, req.body);
    sendSuccess(res, data, 'Payment method updated');
  }

  async delete(req: AuthRequest, res: Response) {
    const storeId = req.user!.storeId || (req as any).storeId;
    await paymentMethodService.delete(storeId!, req.params.id);
    sendSuccess(res, null, 'Payment method deleted');
  }

  async toggle(req: AuthRequest, res: Response) {
    const storeId = req.user!.storeId || (req as any).storeId;
    const data = await paymentMethodService.toggle(storeId!, req.params.id);
    sendSuccess(res, data, 'Payment method toggled');
  }
}

export const paymentMethodController = new PaymentMethodController();
