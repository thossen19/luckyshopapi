import prisma from '../config/database';
import { parsePagination } from '../utils/helpers';

export class AnalyticsService {
  async getSalesReport(storeId: string, startDate?: string, endDate?: string) {
    const where: any = { storeId, status: { notIn: ['CANCELLED'] } };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [totalRevenue, totalOrders, averageOrderValue, ordersByDay] = await Promise.all([
      prisma.order.aggregate({ where, _sum: { totalAmount: true, taxAmount: true, shippingAmount: true, discountAmount: true } }),
      prisma.order.count({ where }),
      prisma.order.aggregate({ where, _avg: { totalAmount: true } }),
      prisma.$queryRaw`
        SELECT DATE(created_at) as date, COUNT(*) as orders, SUM(total_amount) as revenue
        FROM orders
        WHERE store_id = ${storeId} AND status NOT IN ('CANCELLED')
        ${startDate ? prisma.$queryRaw`AND created_at >= ${new Date(startDate)}` : prisma.$queryRaw``}
        ${endDate ? prisma.$queryRaw`AND created_at <= ${new Date(endDate)}` : prisma.$queryRaw``}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
    ]);

    return {
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalTax: totalRevenue._sum.taxAmount || 0,
      totalShipping: totalRevenue._sum.shippingAmount || 0,
      totalDiscounts: totalRevenue._sum.discountAmount || 0,
      totalOrders,
      averageOrderValue: averageOrderValue._avg.totalAmount || 0,
      dailyData: ordersByDay,
    };
  }

  async getProductPerformance(storeId: string) {
    const products = await prisma.product.findMany({
      where: { storeId, deletedAt: null },
      include: {
        orderItems: {
          where: { order: { status: { notIn: ['CANCELLED', 'RETURNED'] } } },
          select: { quantity: true, totalPrice: true },
        },
        reviews: { select: { rating: true } },
      },
    });

    return products
      .map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        totalSold: p.orderItems.reduce((sum, i) => sum + i.quantity, 0),
        totalRevenue: p.orderItems.reduce((sum, i) => sum + Number(i.totalPrice), 0),
        averageRating: p.reviews.length
          ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
          : 0,
        reviewCount: p.reviews.length,
      }))
      .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue);
  }

  async getConversionFunnel(storeId: string, startDate?: string, endDate?: string) {
    const where: any = { storeId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [views, addToCart, checkouts, orders] = await Promise.all([
      prisma.analyticsEvent.count({ where: { ...where, eventType: 'PRODUCT_VIEW' } }),
      prisma.analyticsEvent.count({ where: { ...where, eventType: 'ADD_TO_CART' } }),
      prisma.analyticsEvent.count({ where: { ...where, eventType: 'CHECKOUT_START' } }),
      prisma.order.count({ where: { storeId, status: { notIn: ['CANCELLED'] } } }),
    ]);

    return {
      views,
      addToCart,
      checkouts,
      orders,
      viewToCartRate: views > 0 ? ((addToCart / views) * 100).toFixed(1) : '0',
      cartToCheckoutRate: addToCart > 0 ? ((checkouts / addToCart) * 100).toFixed(1) : '0',
      checkoutToOrderRate: checkouts > 0 ? ((orders / checkouts) * 100).toFixed(1) : '0',
      overallConversion: views > 0 ? ((orders / views) * 100).toFixed(2) : '0',
    };
  }

  async trackEvent(storeId: string, data: {
    eventType: string;
    entityType?: string;
    entityId?: string;
    metadata?: any;
    ip?: string;
    userAgent?: string;
    sessionId?: string;
    customerId?: string;
    page?: string;
    referrer?: string;
  }) {
    return prisma.analyticsEvent.create({
      data: { ...data, storeId },
    });
  }
}

export const analyticsService = new AnalyticsService();
