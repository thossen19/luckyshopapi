import prisma from '../config/database';
import { NotFoundError, BadRequestError } from '../utils/response';

export class CouponService {
  async findAll(storeId: string, filters?: any) {
    const where: any = { storeId };
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    return prisma.coupon.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(storeId: string, id: string) {
    const coupon = await prisma.coupon.findFirst({ where: { id, storeId } });
    if (!coupon) throw new NotFoundError('Coupon');
    return coupon;
  }

  async create(storeId: string, data: any) {
    const existing = await prisma.coupon.findFirst({
      where: { code: data.code, storeId },
    });
    if (existing) throw new Error('Coupon code already exists');

    return prisma.coupon.create({ data: { ...data, storeId } });
  }

  async update(storeId: string, id: string, data: any) {
    const coupon = await prisma.coupon.findFirst({ where: { id, storeId } });
    if (!coupon) throw new NotFoundError('Coupon');
    return prisma.coupon.update({ where: { id }, data });
  }

  async delete(storeId: string, id: string) {
    const coupon = await prisma.coupon.findFirst({ where: { id, storeId } });
    if (!coupon) throw new NotFoundError('Coupon');
    await prisma.coupon.delete({ where: { id } });
    return { message: 'Coupon deleted' };
  }

  async validate(storeId: string, code: string, cartTotal: number) {
    const coupon = await prisma.coupon.findFirst({
      where: { code, storeId, isActive: true },
    });
    if (!coupon) throw new NotFoundError('Coupon');
    if (coupon.endDate && coupon.endDate < new Date()) throw new BadRequestError('Coupon expired');
    if (coupon.startDate && coupon.startDate > new Date()) throw new BadRequestError('Coupon not yet active');
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw new BadRequestError('Coupon usage limit reached');
    if (coupon.minimumAmount && cartTotal < Number(coupon.minimumAmount)) {
      throw new BadRequestError(`Minimum order amount: ${coupon.minimumAmount}`);
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = cartTotal * (Number(coupon.discountValue) / 100);
      if (coupon.maximumDiscount) discount = Math.min(discount, Number(coupon.maximumDiscount));
    } else {
      discount = Math.min(cartTotal, Number(coupon.discountValue));
    }

    return { coupon, discount };
  }
}

function parsePagination(page?: string, limit?: string) {
  const p = Math.max(1, parseInt(page || '1', 10));
  const l = Math.min(100, Math.max(1, parseInt(limit || '20', 10)));
  return { page: p, limit: l, skip: (p - 1) * l };
}

export const couponService = new CouponService();
