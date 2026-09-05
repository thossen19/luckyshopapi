import prisma from '../config/database';
import { NotFoundError } from '../utils/response';
import { parsePagination } from '../utils/helpers';

export class PromotionService {
  async findAll(storeId: string | undefined, filters?: any) {
    const { page, limit, skip } = parsePagination(filters?.page, filters?.limit);
    const where: any = {};
    
    if (storeId) {
      where.storeId = storeId;
    }
    
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }
    if (filters?.type) where.type = filters.type;

    const [promotions, total] = await Promise.all([
      prisma.promotion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.promotion.count({ where }),
    ]);

    return { data: promotions, total, page, limit };
  }

  async findById(storeId: string, id: string) {
    const promo = await prisma.promotion.findFirst({ where: { id, storeId } });
    if (!promo) throw new NotFoundError('Promotion');
    return promo;
  }

  async create(storeId: string, data: any) {
    return prisma.promotion.create({ data: { ...data, storeId } });
  }

  async update(storeId: string, id: string, data: any) {
    const promo = await prisma.promotion.findFirst({ where: { id, storeId } });
    if (!promo) throw new NotFoundError('Promotion');
    return prisma.promotion.update({ where: { id }, data });
  }

  async delete(storeId: string, id: string) {
    const promo = await prisma.promotion.findFirst({ where: { id, storeId } });
    if (!promo) throw new NotFoundError('Promotion');
    await prisma.promotion.delete({ where: { id } });
    return { message: 'Promotion deleted' };
  }

  async getActive(storeId: string) {
    const now = new Date();
    return prisma.promotion.findMany({
      where: {
        storeId,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { priority: 'desc' },
    });
  }
}

export const promotionService = new PromotionService();
