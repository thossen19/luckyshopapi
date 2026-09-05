import prisma from '../config/database';
import { NotFoundError } from '../utils/response';

export class ReviewService {
  async findByProduct(storeId: string, productId: string, filters: any) {
    const { page, limit, skip } = parsePagination(filters.page, filters.limit);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId, storeId, status: 'APPROVED' },
        include: { customer: { select: { firstName: true, lastName: true, avatar: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count({ where: { productId, status: 'APPROVED' } }),
    ]);

    return { data: reviews, total, page, limit };
  }

  async create(storeId: string, customerId: string, data: any) {
    const existing = await prisma.review.findFirst({
      where: { customerId, productId: data.productId },
    });
    if (existing) throw new Error('You have already reviewed this product');

    return prisma.review.create({
      data: { ...data, customerId, storeId, status: 'PENDING' },
    });
  }

  async update(storeId: string, id: string, customerId: string, data: any) {
    const review = await prisma.review.findFirst({ where: { id, storeId } });
    if (!review) throw new NotFoundError('Review');
    if (review.customerId !== customerId) throw new Error('Not authorized to edit this review');
    return prisma.review.update({
      where: { id },
      data: {
        rating: data.rating ?? review.rating,
        title: data.title !== undefined ? data.title : review.title,
        comment: data.comment !== undefined ? data.comment : review.comment,
        status: 'PENDING',
      },
    });
  }

  async remove(storeId: string, id: string, customerId: string) {
    const review = await prisma.review.findFirst({ where: { id, storeId } });
    if (!review) throw new NotFoundError('Review');
    if (review.customerId !== customerId) throw new Error('Not authorized to delete this review');
    await prisma.review.delete({ where: { id } });
    return review;
  }

  async updateStatus(storeId: string, id: string, status: string) {
    const review = await prisma.review.findFirst({ where: { id, storeId } });
    if (!review) throw new NotFoundError('Review');
    return prisma.review.update({ where: { id }, data: { status: status as any } });
  }

  async respond(storeId: string, id: string, response: string) {
    const review = await prisma.review.findFirst({ where: { id, storeId } });
    if (!review) throw new NotFoundError('Review');
    return prisma.review.update({
      where: { id },
      data: { response, respondedAt: new Date() },
    });
  }

  async getPending(storeId: string) {
    return prisma.review.findMany({
      where: { storeId, status: 'PENDING' },
      include: {
        customer: { select: { firstName: true, lastName: true, email: true } },
        product: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

function parsePagination(page?: string, limit?: string) {
  const p = Math.max(1, parseInt(page || '1', 10));
  const l = Math.min(100, Math.max(1, parseInt(limit || '20', 10)));
  return { page: p, limit: l, skip: (p - 1) * l };
}

export const reviewService = new ReviewService();
