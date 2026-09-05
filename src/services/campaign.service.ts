import prisma from '../config/database';
import { NotFoundError } from '../utils/response';
import { parsePagination } from '../utils/helpers';
import { CampaignStatus } from '@prisma/client';

export class CampaignService {
  async findAll(storeId: string, filters: any) {
    const { page, limit, skip } = parsePagination(filters.page, filters.limit);
    const where: any = { storeId };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }
    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.campaign.count({ where }),
    ]);

    return { data: campaigns, total, page, limit };
  }

  async findById(storeId: string, id: string) {
    const campaign = await prisma.campaign.findFirst({
      where: { id, storeId },
    });
    if (!campaign) throw new NotFoundError('Campaign');
    return campaign;
  }

  async create(storeId: string, data: any) {
    return prisma.campaign.create({
      data: {
        ...data,
        storeId,
        metrics: data.metrics || {},
        recipients: data.recipients || [],
      },
    });
  }

  async update(storeId: string, id: string, data: any) {
    const campaign = await prisma.campaign.findFirst({ where: { id, storeId } });
    if (!campaign) throw new NotFoundError('Campaign');

    return prisma.campaign.update({
      where: { id },
      data: {
        ...data,
        metrics: data.metrics || campaign.metrics,
        recipients: data.recipients || campaign.recipients,
      },
    });
  }

  async updateStatus(storeId: string, id: string, status: CampaignStatus) {
    const campaign = await prisma.campaign.findFirst({ where: { id, storeId } });
    if (!campaign) throw new NotFoundError('Campaign');

    return prisma.campaign.update({
      where: { id },
      data: { status },
    });
  }

  async delete(storeId: string, id: string) {
    const campaign = await prisma.campaign.findFirst({ where: { id, storeId } });
    if (!campaign) throw new NotFoundError('Campaign');

    await prisma.campaign.delete({ where: { id } });
  }

  async getStats(storeId: string) {
    const [totalCampaigns, byStatus, byType] = await Promise.all([
      prisma.campaign.count({ where: { storeId } }),
      prisma.campaign.groupBy({
        by: ['status'],
        where: { storeId },
        _count: true,
      }),
      prisma.campaign.groupBy({
        by: ['type'],
        where: { storeId },
        _count: true,
      }),
    ]);

    return {
      totalCampaigns,
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count })),
      byType: byType.map((t) => ({ type: t.type, count: t._count })),
    };
  }
}

export const campaignService = new CampaignService();
