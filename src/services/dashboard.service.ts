import prisma from '../config/database';
import { parsePagination } from '../utils/helpers';

export class DashboardService {
  async getMetrics(storeId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalRevenue,
      monthlyRevenue,
      todayRevenue,
      totalOrders,
      monthlyOrders,
      todayOrders,
      totalCustomers,
      newCustomersThisMonth,
      totalProducts,
      lowStockCount,
      averageOrderValue,
      recentOrders,
      topProducts,
      revenueByDay,
      ordersByStatus,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { storeId, status: { notIn: ['CANCELLED'] } },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: { storeId, status: { notIn: ['CANCELLED'] }, createdAt: { gte: startOfMonth } },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: { storeId, status: { notIn: ['CANCELLED'] }, createdAt: { gte: startOfDay } },
        _sum: { totalAmount: true },
      }),
      prisma.order.count({
        where: { storeId, status: { notIn: ['CANCELLED'] } },
      }),
      prisma.order.count({
        where: { storeId, status: { notIn: ['CANCELLED'] }, createdAt: { gte: startOfMonth } },
      }),
      prisma.order.count({
        where: { storeId, status: { notIn: ['CANCELLED'] }, createdAt: { gte: startOfDay } },
      }),
      prisma.customer.count({ where: { storeId } }),
      prisma.customer.count({
        where: { storeId, createdAt: { gte: startOfMonth } },
      }),
      prisma.product.count({ where: { storeId, deletedAt: null } }),
      prisma.product.count({
        where: {
          storeId, deletedAt: null, status: 'ACTIVE', trackInventory: true,
          stockQuantity: { lte: 5 },
        },
      }),
      prisma.order.aggregate({
        where: { storeId, status: { notIn: ['CANCELLED'] } },
        _avg: { totalAmount: true },
      }),
      prisma.order.findMany({
        where: { storeId },
        include: {
          customer: { select: { firstName: true, lastName: true, email: true } },
          items: { select: { productName: true, quantity: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.$queryRaw`
        SELECT p.name, SUM(oi.quantity) as totalSold, SUM(oi.total_price) as revenue
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.store_id = ${storeId} AND o.status NOT IN ('CANCELLED')
        GROUP BY p.id, p.name
        ORDER BY revenue DESC
        LIMIT 10
      `,
      prisma.$queryRaw`
        SELECT DATE(created_at) as date, SUM(total_amount) as revenue
        FROM orders
        WHERE store_id = ${storeId} AND status NOT IN ('CANCELLED')
        AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
      prisma.order.groupBy({
        by: ['status'],
        where: { storeId, createdAt: { gte: startOfMonth } },
        _count: true,
      }),
    ]);

    return {
      revenue: {
        total: totalRevenue._sum.totalAmount || 0,
        monthly: monthlyRevenue._sum.totalAmount || 0,
        today: todayRevenue._sum.totalAmount || 0,
      },
      orders: {
        total: totalOrders,
        monthly: monthlyOrders,
        today: todayOrders,
      },
      customers: {
        total: totalCustomers,
        newThisMonth: newCustomersThisMonth,
      },
      products: {
        total: totalProducts,
        lowStock: lowStockCount,
      },
      averageOrderValue: averageOrderValue._avg.totalAmount || 0,
      recentOrders,
      topProducts,
      revenueByDay,
      ordersByStatus,
    };
  }

  async getRevenueChart(storeId: string, period = '30d') {
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    return prisma.$queryRaw`
      SELECT DATE(created_at) as date,
             COUNT(*) as orders,
             SUM(total_amount) as revenue
      FROM orders
      WHERE store_id = ${storeId} AND status NOT IN ('CANCELLED')
      AND created_at >= DATE_SUB(NOW(), INTERVAL ${days} DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
  }
}

export const dashboardService = new DashboardService();
