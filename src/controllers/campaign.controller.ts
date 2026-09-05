import { Response } from 'express';
import { campaignService } from '../services/campaign.service';
import { AuthRequest } from '../types';
import { sendSuccess, sendPaginated } from '../utils/response';

export class CampaignController {
  async findAll(req: AuthRequest, res: Response) {
    const storeId = req.user!.role === 'SUPER_ADMIN'
      ? (req.query.storeId as string) || undefined
      : (req as any).storeId || req.user!.storeId;
    const result = await campaignService.findAll(storeId!, req.query);
    sendPaginated(res, result.data, result.total, result.page, result.limit);
  }

  async findById(req: AuthRequest, res: Response) {
    const storeId = req.user!.role === 'SUPER_ADMIN'
      ? (req.query.storeId as string) || undefined
      : (req as any).storeId || req.user!.storeId;
    const campaign = await campaignService.findById(storeId!, req.params.id);
    sendSuccess(res, campaign);
  }

  async create(req: AuthRequest, res: Response) {
    const storeId = req.user!.role === 'SUPER_ADMIN'
      ? (req.body.storeId || (req as any).storeId || req.user!.storeId)
      : (req as any).storeId || req.user!.storeId;
    const campaign = await campaignService.create(storeId!, req.body);
    sendSuccess(res, campaign, 'Campaign created', 201);
  }

  async update(req: AuthRequest, res: Response) {
    const storeId = req.user!.role === 'SUPER_ADMIN'
      ? (req.query.storeId as string) || undefined
      : (req as any).storeId || req.user!.storeId;
    const campaign = await campaignService.update(storeId!, req.params.id, req.body);
    sendSuccess(res, campaign, 'Campaign updated');
  }

  async updateStatus(req: AuthRequest, res: Response) {
    const storeId = req.user!.role === 'SUPER_ADMIN'
      ? (req.query.storeId as string) || undefined
      : (req as any).storeId || req.user!.storeId;
    const campaign = await campaignService.updateStatus(storeId!, req.params.id, req.body.status);
    sendSuccess(res, campaign, 'Campaign status updated');
  }

  async delete(req: AuthRequest, res: Response) {
    const storeId = req.user!.role === 'SUPER_ADMIN'
      ? (req.query.storeId as string) || undefined
      : (req as any).storeId || req.user!.storeId;
    await campaignService.delete(storeId!, req.params.id);
    sendSuccess(res, null, 'Campaign deleted');
  }
}
