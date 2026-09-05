import { Response } from 'express';
import { attributeService } from '../services/attribute.service';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';

export class AttributeController {
  async findAll(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user?.storeId || req.query.storeId as string;
    const attributes = await attributeService.findAll(storeId as string);
    sendSuccess(res, attributes);
  }

  async findById(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const attribute = await attributeService.findById(storeId as string, req.params.id);
    sendSuccess(res, attribute);
  }

  async create(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const attribute = await attributeService.create(storeId as string, req.body);
    sendSuccess(res, attribute, 'Attribute created', 201);
  }

  async update(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const attribute = await attributeService.update(storeId as string, req.params.id, req.body);
    sendSuccess(res, attribute, 'Attribute updated');
  }

  async delete(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    await attributeService.delete(storeId as string, req.params.id);
    sendSuccess(res, null, 'Attribute deleted');
  }

  async addValue(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const value = await attributeService.addValue(
      storeId as string,
      req.params.id,
      req.body.value,
      req.body.colorCode
    );
    sendSuccess(res, value, 'Value added', 201);
  }

  async removeValue(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    await attributeService.removeValue(storeId as string, req.params.id, req.params.valueId);
    sendSuccess(res, null, 'Value removed');
  }
}

export const attributeController = new AttributeController();
