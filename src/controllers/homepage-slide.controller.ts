import { Response } from 'express';
import { homepageSlideService } from '../services/homepage-slide.service';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';

export class HomepageSlideController {
  async findAll(req: AuthRequest, res: Response) {
    const storeId = ((req as any).storeId || req.user?.storeId || req.query.storeId) as string;
    const slides = await homepageSlideService.findAll(storeId);
    sendSuccess(res, slides);
  }

  async findActive(req: AuthRequest, res: Response) {
    const storeId = ((req as any).storeId || req.user?.storeId || req.query.storeId) as string;
    const slides = await homepageSlideService.findActive(storeId);
    sendSuccess(res, slides);
  }

  async findById(req: AuthRequest, res: Response) {
    const storeId = ((req as any).storeId || req.user?.storeId || req.query.storeId) as string;
    const slide = await homepageSlideService.findById(storeId, req.params.id);
    sendSuccess(res, slide);
  }

  async create(req: AuthRequest, res: Response) {
    const storeId = ((req as any).storeId || req.user!.storeId) as string;
    const slide = await homepageSlideService.create(storeId, req.body);
    sendSuccess(res, slide, 'Slide created', 201);
  }

  async update(req: AuthRequest, res: Response) {
    const storeId = ((req as any).storeId || req.user!.storeId) as string;
    const slide = await homepageSlideService.update(storeId, req.params.id, req.body);
    sendSuccess(res, slide, 'Slide updated');
  }

  async reorder(req: AuthRequest, res: Response) {
    const storeId = ((req as any).storeId || req.user!.storeId) as string;
    const result = await homepageSlideService.reorder(storeId, req.body.ids);
    sendSuccess(res, result, 'Slides reordered');
  }

  async delete(req: AuthRequest, res: Response) {
    const storeId = ((req as any).storeId || req.user!.storeId) as string;
    const result = await homepageSlideService.delete(storeId, req.params.id);
    sendSuccess(res, result, 'Slide deleted');
  }
}

export const homepageSlideController = new HomepageSlideController();
