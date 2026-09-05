import prisma from '../config/database';
import { NotFoundError } from '../utils/response';
import { parsePagination } from '../utils/helpers';

export class CustomerService {
  async findAll(storeId: string, filters: any) {
    const { page, limit, skip } = parsePagination(filters.page, filters.limit);
    const where: any = { storeId };

    if (filters.search) {
      where.OR = [
        { email: { contains: filters.search } },
        { firstName: { contains: filters.search } },
        { lastName: { contains: filters.search } },
        { phone: { contains: filters.search } },
      ];
    }
    if (filters.segment) where.segment = filters.segment;

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          _count: { select: { orders: true } },
          orders: { select: { totalAmount: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 1 },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where }),
    ]);

    return { data: customers, total, page, limit };
  }

  async findById(storeId: string, id: string) {
    const customer = await prisma.customer.findFirst({
      where: { id, storeId },
      include: {
        addresses: true,
        orders: {
          include: { items: { include: { product: { select: { name: true, images: { take: 1 } } } } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        wishlistItems: { include: { product: { select: { name: true, price: true, images: { take: 1 } } } } },
        _count: { select: { orders: true, reviews: true } },
      },
    });
    if (!customer) throw new NotFoundError('Customer');
    return customer;
  }

  async create(storeId: string, data: any) {
    const existing = await prisma.customer.findUnique({
      where: { email_storeId: { email: data.email, storeId } },
    });
    if (existing) throw new Error('Customer with this email already exists');

    return prisma.customer.create({
      data: { ...data, storeId },
    });
  }

  async update(storeId: string, id: string, data: any) {
    const customer = await prisma.customer.findFirst({ where: { id, storeId } });
    if (!customer) throw new NotFoundError('Customer');
    return prisma.customer.update({ where: { id }, data });
  }

  async addAddress(storeId: string, customerId: string, data: any) {
    const customer = await prisma.customer.findFirst({ where: { id: customerId, storeId } });
    if (!customer) throw new NotFoundError('Customer');

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { customerId, type: data.type || 'SHIPPING' },
        data: { isDefault: false },
      });
    }

    return prisma.address.create({
      data: { ...data, customerId },
    });
  }

  async getSegments(storeId: string) {
    const segments = await prisma.customer.groupBy({
      by: ['segment'],
      where: { storeId },
      _count: true,
      _avg: { totalSpent: true, totalOrders: true },
    });
    return segments.filter((s) => s.segment);
  }

  async getStats(storeId: string) {
    const [totalCustomers, newThisMonth, totalRevenue, averageLifetimeValue] = await Promise.all([
      prisma.customer.count({ where: { storeId } }),
      prisma.customer.count({
        where: {
          storeId,
          createdAt: { gte: new Date(new Date().setDate(1)) },
        },
      }),
      prisma.customer.aggregate({ where: { storeId }, _sum: { totalSpent: true } }),
      prisma.customer.aggregate({ where: { storeId }, _avg: { totalSpent: true } }),
    ]);

    return {
      totalCustomers,
      newThisMonth,
      totalRevenue: totalRevenue._sum.totalSpent || 0,
      averageLifetimeValue: averageLifetimeValue._avg.totalSpent || 0,
    };
  }
}

export const customerService = new CustomerService();
