import { Response } from 'express';
import { customPageService } from '../services/custom-page.service';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';

export class CustomPageController {
  async findAll(req: AuthRequest, res: Response) {
    const storeId = ((req as any).storeId || req.user?.storeId || req.query.storeId) as string;
    const pages = await customPageService.findAll(storeId);
    sendSuccess(res, pages);
  }

  async findBySlug(req: AuthRequest, res: Response) {
    const storeId = ((req as any).storeId || req.user?.storeId || req.query.storeId) as string;
    const page = await customPageService.findBySlug(storeId, req.params.slug);
    sendSuccess(res, page);
  }

  async findPublishedBySlug(req: AuthRequest, res: Response) {
    const storeId = ((req as any).storeId || req.user?.storeId || req.query.storeId) as string;
    const page = await customPageService.findPublishedBySlug(storeId, req.params.slug);
    sendSuccess(res, page);
  }

  async findById(req: AuthRequest, res: Response) {
    const storeId = ((req as any).storeId || req.user?.storeId || req.query.storeId) as string;
    const page = await customPageService.findById(storeId, req.params.id);
    sendSuccess(res, page);
  }

  async create(req: AuthRequest, res: Response) {
    const storeId = ((req as any).storeId || req.user!.storeId) as string;
    const page = await customPageService.create(storeId, req.body);
    sendSuccess(res, page, 'Page created', 201);
  }

  async update(req: AuthRequest, res: Response) {
    const storeId = ((req as any).storeId || req.user!.storeId) as string;
    const page = await customPageService.update(storeId, req.params.id, req.body);
    sendSuccess(res, page, 'Page updated');
  }

  async delete(req: AuthRequest, res: Response) {
    const storeId = ((req as any).storeId || req.user!.storeId) as string;
    const result = await customPageService.delete(storeId, req.params.id);
    sendSuccess(res, result, 'Page deleted');
  }
}

export const customPageController = new CustomPageController();
