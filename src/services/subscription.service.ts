import prisma from '../config/database';

export class SubscriptionService {
  async getPlans() {
    return prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
  }

  async getStoreSubscription(storeId: string) {
    return prisma.subscription.findFirst({
      where: { storeId },
      include: { plan: true, invoices: { orderBy: { createdAt: 'desc' }, take: 10 } },
    });
  }

  async subscribe(storeId: string, planId: string) {
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new Error('Plan not found');

    const now = new Date();
    const periodEnd = new Date(now);
    if (plan.billingCycle === 'monthly') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    const existing = await prisma.subscription.findFirst({ where: { storeId } });
    if (existing) {
      return prisma.subscription.update({
        where: { id: existing.id },
        data: {
          planId,
          amount: plan.price,
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
        include: { plan: true },
      });
    }

    const trialEnd = plan.trialDays > 0
      ? new Date(now.getTime() + plan.trialDays * 24 * 60 * 60 * 1000)
      : null;

    return prisma.subscription.create({
      data: {
        storeId,
        planId,
        amount: plan.price,
        status: trialEnd ? 'TRIALING' : 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: trialEnd || periodEnd,
        trialStart: trialEnd ? now : null,
        trialEnd,
      },
      include: { plan: true },
    });
  }

  async cancel(storeId: string) {
    const sub = await prisma.subscription.findFirst({ where: { storeId } });
    if (!sub) throw new Error('No active subscription');

    return prisma.subscription.update({
      where: { id: sub.id },
      data: {
        canceledAt: new Date(),
        cancelAtPeriodEnd: true,
      },
    });
  }

  async checkLimits(storeId: string) {
    const sub = await prisma.subscription.findFirst({
      where: { storeId },
      include: { plan: true },
    });
    if (!sub || !sub.plan) return { withinLimits: true };

    const [productCount, employeeCount, orderCount] = await Promise.all([
      prisma.product.count({ where: { storeId, deletedAt: null } }),
      prisma.user.count({ where: { storeId } }),
      prisma.order.count({ where: { storeId, createdAt: { gte: sub.currentPeriodStart } } }),
    ]);

    const limits: any = {};
    if (sub.plan.maxProducts) limits.products = { current: productCount, max: sub.plan.maxProducts, exceeded: productCount >= sub.plan.maxProducts };
    if (sub.plan.maxEmployees) limits.employees = { current: employeeCount, max: sub.plan.maxEmployees, exceeded: employeeCount >= sub.plan.maxEmployees };
    if (sub.plan.maxOrders) limits.orders = { current: orderCount, max: sub.plan.maxOrders, exceeded: orderCount >= sub.plan.maxOrders };

    return { limits, withinLimits: Object.values(limits).every((l: any) => !l.exceeded) };
  }
}

export const subscriptionService = new SubscriptionService();
