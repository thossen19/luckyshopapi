import prisma from '../config/database';

export class ExpenseService {
  async findAll(storeId: string, filters?: any) {
    const where: any = { storeId };
    if (filters?.category) where.category = filters.category;
    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = new Date(filters.startDate);
      if (filters.endDate) where.date.lte = new Date(filters.endDate);
    }

    return prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  async create(storeId: string, data: any) {
    return prisma.expense.create({ data: { ...data, storeId } });
  }

  async update(storeId: string, id: string, data: any) {
    const expense = await prisma.expense.findFirst({ where: { id, storeId } });
    if (!expense) throw new Error('Expense not found');
    return prisma.expense.update({ where: { id }, data });
  }

  async delete(storeId: string, id: string) {
    const expense = await prisma.expense.findFirst({ where: { id, storeId } });
    if (!expense) throw new Error('Expense not found');
    await prisma.expense.delete({ where: { id } });
    return { message: 'Expense deleted' };
  }

  async getSummary(storeId: string, startDate?: string, endDate?: string) {
    const where: any = { storeId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [totalExpenses, byCategory] = await Promise.all([
      prisma.expense.aggregate({ where, _sum: { amount: true } }),
      prisma.expense.groupBy({
        by: ['category'],
        where,
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return {
      totalExpenses: totalExpenses._sum.amount || 0,
      byCategory,
    };
  }

  async getProfitLoss(storeId: string, startDate?: string, endDate?: string) {
    const orderWhere: any = { storeId, status: { notIn: ['CANCELLED'] } };
    const expenseWhere: any = { storeId };
    if (startDate || endDate) {
      const dateFilter: any = {};
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) dateFilter.lte = new Date(endDate);
      orderWhere.createdAt = dateFilter;
      expenseWhere.date = dateFilter;
    }

    const [revenue, expenses, refunds] = await Promise.all([
      prisma.order.aggregate({
        where: orderWhere,
        _sum: { totalAmount: true, taxAmount: true, shippingAmount: true, discountAmount: true },
      }),
      prisma.expense.aggregate({ where: expenseWhere, _sum: { amount: true } }),
      prisma.refund.aggregate({
        where: { order: { storeId }, status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    const totalRevenue = revenue._sum.totalAmount || 0;
    const totalExpenses = expenses._sum.amount || 0;
    const totalRefunds = refunds._sum.amount || 0;
    const tax = revenue._sum.taxAmount || 0;
    const shipping = revenue._sum.shippingAmount || 0;
    const discounts = revenue._sum.discountAmount || 0;
    const grossProfit = Number(totalRevenue) - Number(totalExpenses);
    const netProfit = grossProfit - Number(totalRefunds);

    return {
      revenue: totalRevenue,
      expenses: totalExpenses,
      refunds: totalRefunds,
      tax,
      shipping,
      discounts,
      grossProfit,
      netProfit,
    };
  }
}

export const expenseService = new ExpenseService();
