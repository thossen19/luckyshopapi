import prisma from '../config/database';

export class LoyaltyService {
  async getBalance(storeId: string, customerId: string) {
    const points = await prisma.loyaltyPoint.aggregate({
      where: { customerId },
      _sum: { points: true },
    });
    return { balance: points._sum.points || 0 };
  }

  async getHistory(storeId: string, customerId: string) {
    return prisma.loyaltyPoint.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async earnPoints(customerId: string, points: number, reference?: string, notes?: string) {
    return prisma.loyaltyPoint.create({
      data: {
        customerId,
        points,
        type: 'EARNED',
        reference,
        notes,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
    });
  }

  async redeemPoints(customerId: string, points: number, reference?: string) {
    const balance = await prisma.loyaltyPoint.aggregate({
      where: { customerId },
      _sum: { points: true },
    });

    if ((balance._sum.points || 0) < points) {
      throw new Error('Insufficient loyalty points');
    }

    return prisma.loyaltyPoint.create({
      data: {
        customerId,
        points: -points,
        type: 'REDEEMED',
        reference,
      },
    });
  }

  async getStats(storeId: string) {
    const totalPoints = await prisma.loyaltyPoint.aggregate({
      where: { customer: { storeId }, type: 'EARNED' },
      _sum: { points: true },
      _count: true,
    });

    const redeemedPoints = await prisma.loyaltyPoint.aggregate({
      where: { customer: { storeId }, type: 'REDEEMED' },
      _sum: { points: true },
    });

    return {
      totalEarned: totalPoints._sum.points || 0,
      totalRedeemed: Math.abs(redeemedPoints._sum.points || 0),
      totalTransactions: totalPoints._count,
    };
  }
}

export const loyaltyService = new LoyaltyService();
