import { Response } from 'express';
import { menuService } from '../services/menu.service';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';

export class MenuController {
  async findAll(req: AuthRequest, res: Response) {
    const storeId = ((req as any).storeId || req.user?.storeId || req.query.storeId) as string;
    const menus = await menuService.findAll(storeId);
    sendSuccess(res, menus);
  }

  async findByLocation(req: AuthRequest, res: Response) {
    const storeId = ((req as any).storeId || req.user?.storeId || req.query.storeId) as string;
    const menu = await menuService.findByLocation(req.params.location, storeId);
    sendSuccess(res, menu);
  }

  async findById(req: AuthRequest, res: Response) {
    const storeId = ((req as any).storeId || req.user?.storeId || req.query.storeId) as string;
    const menu = await menuService.findById(storeId, req.params.id);
    sendSuccess(res, menu);
  }

  async create(req: AuthRequest, res: Response) {
    const storeId = ((req as any).storeId || req.user!.storeId) as string;
    const menu = await menuService.create(storeId, req.body);
    sendSuccess(res, menu, 'Menu created', 201);
  }

  async update(req: AuthRequest, res: Response) {
    const storeId = ((req as any).storeId || req.user!.storeId) as string;
    const menu = await menuService.update(storeId, req.params.id, req.body);
    sendSuccess(res, menu, 'Menu updated');
  }

  async delete(req: AuthRequest, res: Response) {
    const storeId = ((req as any).storeId || req.user!.storeId) as string;
    const result = await menuService.delete(storeId, req.params.id);
    sendSuccess(res, result, 'Menu deleted');
  }

  async createItem(req: AuthRequest, res: Response) {
    const storeId = ((req as any).storeId || req.user!.storeId) as string;
    const item = await menuService.createItem(storeId, req.params.menuId, req.body);
    sendSuccess(res, item, 'Menu item created', 201);
  }

  async updateItem(req: AuthRequest, res: Response) {
    const storeId = ((req as any).storeId || req.user!.storeId) as string;
    const item = await menuService.updateItem(storeId, req.params.itemId, req.body);
    sendSuccess(res, item, 'Menu item updated');
  }

  async deleteItem(req: AuthRequest, res: Response) {
    const storeId = ((req as any).storeId || req.user!.storeId) as string;
    const result = await menuService.deleteItem(storeId, req.params.itemId);
    sendSuccess(res, result, 'Menu item deleted');
  }

  async getPromotionBar(req: AuthRequest, res: Response) {
    const storeId = ((req as any).storeId || req.user?.storeId || req.query.storeId) as string;
    const bar = await menuService.getPromotionBar(storeId);
    sendSuccess(res, bar);
  }

  async updatePromotionBar(req: AuthRequest, res: Response) {
    const storeId = ((req as any).storeId || req.user!.storeId) as string;
    const bar = await menuService.updatePromotionBar(storeId, req.body);
    sendSuccess(res, bar, 'Promotion bar updated');
  }
}

export const menuController = new MenuController();
