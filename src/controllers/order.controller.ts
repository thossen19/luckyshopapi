import { Response } from 'express';
import { orderService } from '../services/order.service';
import { AuthRequest } from '../types';
import { sendSuccess, sendPaginated } from '../utils/response';

export class OrderController {
  async findMyOrders(req: AuthRequest, res: Response) {
    // Get orders for the authenticated user (customer dashboard)
    const orders = await orderService.findAllByUser(req.user!.id, req.query);
    sendPaginated(res, orders.data, orders.total, orders.page, orders.limit);
  }

  async findAll(req: AuthRequest, res: Response) {
    // SUPER_ADMIN can see all orders, others only their store
    const storeId = req.user!.role === 'SUPER_ADMIN' ? undefined : (req as any).storeId || req.user!.storeId;
    const result = await orderService.findAll(storeId, req.query);
    sendPaginated(res, result.data, result.total, result.page, result.limit);
  }

  async findById(req: AuthRequest, res: Response) {
    const storeId = req.user!.role === 'SUPER_ADMIN' ? undefined : (req as any).storeId || req.user!.storeId;
    const order = await orderService.findById(storeId, req.params.id);
    sendSuccess(res, order);
  }

  async create(req: AuthRequest, res: Response) {
    // Allow public orders - get storeId from body or user
    const storeId = (req as any).storeId || req.user?.storeId || req.body.storeId;
    if (!storeId) {
      return res.status(400).json({ success: false, message: 'Store ID is required' });
    }
    // Pass userId from authenticated user to associate order with customer account
    const orderData = {
      ...req.body,
      userId: req.user?.id || null,
    };
    const order = await orderService.create(storeId, orderData);
    sendSuccess(res, order, 'Order created', 201);
  }

  async updateStatus(req: AuthRequest, res: Response) {
    const storeId = req.user!.role === 'SUPER_ADMIN' ? undefined : (req as any).storeId || req.user!.storeId;
    const { status, note } = req.body;
    const order = await orderService.updateStatus(storeId, req.params.id, status, note, req.user?.id);
    sendSuccess(res, order, 'Order status updated');
  }

  async addPayment(req: AuthRequest, res: Response) {
    const storeId = req.user!.role === 'SUPER_ADMIN' ? undefined : (req as any).storeId || req.user!.storeId;
    const payment = await orderService.addPayment(storeId, req.params.id, req.body);
    sendSuccess(res, payment, 'Payment added', 201);
  }

  async addShipment(req: AuthRequest, res: Response) {
    const storeId = req.user!.role === 'SUPER_ADMIN' ? undefined : (req as any).storeId || req.user!.storeId;
    const shipment = await orderService.addShipment(storeId, req.params.id, req.body);
    sendSuccess(res, shipment, 'Shipment added', 201);
  }

  async getStats(req: AuthRequest, res: Response) {
    const storeId = req.user!.role === 'SUPER_ADMIN' ? undefined : (req as any).storeId || req.user!.storeId;
    const stats = await orderService.getStats(storeId, req.query.startDate as string, req.query.endDate as string);
    sendSuccess(res, stats);
  }
}

export const orderController = new OrderController();
