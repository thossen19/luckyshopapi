import prisma from '../config/database';
import { NotFoundError, BadRequestError } from '../utils/response';
import { parsePagination } from '../utils/helpers';
import { Decimal } from '@prisma/client/runtime/library';

type WalletType =
  | 'TOPUP'
  | 'WITHDRAWAL'
  | 'PAYMENT'
  | 'REFUND'
  | 'CASHBACK'
  | 'ROUNDING'
  | 'ADJUSTMENT'
  | 'REFERRAL';

export class WalletService {
  async getBalance(storeId: string | undefined, customerId: string) {
    const customer = await prisma.customer.findFirst({
      where: storeId ? { id: customerId, storeId } : { id: customerId },
      select: {
        id: true,
        walletBalance: true,
        walletCashback: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });
    if (!customer) throw new NotFoundError('Customer');
    return customer;
  }

  async getTransactions(storeId: string | undefined, customerId: string, filters: any) {
    const { page, limit, skip } = parsePagination(filters.page, filters.limit);
    const where: any = {
      customerId,
      ...(storeId ? { storeId } : {}),
    };
    if (filters.type) where.type = filters.type;
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    const [data, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.walletTransaction.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async credit(
    storeId: string,
    customerId: string,
    amount: number | string,
    type: WalletType,
    payload: { orderId?: string; reference?: string; notes?: string; createdById?: string } = {}
  ) {
    const customer = await prisma.customer.findFirst({ where: { id: customerId, storeId } });
    if (!customer) throw new NotFoundError('Customer');

    const amt = new Decimal(amount);
    if (amt.lessThanOrEqualTo(0)) throw new BadRequestError('Amount must be greater than zero');

    const newBalance = new Decimal(customer.walletBalance).add(amt);

    const tx = await prisma.$transaction(async (tx) => {
      const updated = await tx.customer.update({
        where: { id: customerId },
        data: { walletBalance: newBalance },
      });
      const record = await tx.walletTransaction.create({
        data: {
          customerId,
          storeId,
          type,
          amount: amt,
          balanceAfter: newBalance,
          orderId: payload.orderId,
          reference: payload.reference,
          notes: payload.notes,
          createdById: payload.createdById,
        },
      });
      return { record, updated };
    });

    return tx.record;
  }

  async debit(
    storeId: string,
    customerId: string,
    amount: number | string,
    type: WalletType,
    payload: { orderId?: string; reference?: string; notes?: string; createdById?: string } = {}
  ) {
    const customer = await prisma.customer.findFirst({ where: { id: customerId, storeId } });
    if (!customer) throw new NotFoundError('Customer');

    const amt = new Decimal(amount);
    if (amt.lessThanOrEqualTo(0)) throw new BadRequestError('Amount must be greater than zero');

    const current = new Decimal(customer.walletBalance);
    if (current.lessThan(amt)) {
      throw new BadRequestError('Insufficient wallet balance');
    }

    const newBalance = current.sub(amt);

    const tx = await prisma.$transaction(async (tx) => {
      const updated = await tx.customer.update({
        where: { id: customerId },
        data: { walletBalance: newBalance },
      });
      const record = await tx.walletTransaction.create({
        data: {
          customerId,
          storeId,
          type,
          amount: amt.negated(),
          balanceAfter: newBalance,
          orderId: payload.orderId,
          reference: payload.reference,
          notes: payload.notes,
          createdById: payload.createdById,
        },
      });
      return { record, updated };
    });

    return tx.record;
  }

  async applyCashback(
    storeId: string,
    customerId: string,
    orderTotal: number | string,
    orderId: string,
    ratePct = 2
  ) {
    const customer = await prisma.customer.findFirst({ where: { id: customerId, storeId } });
    if (!customer) throw new NotFoundError('Customer');

    const total = new Decimal(orderTotal);
    const cashback = total.mul(ratePct).div(100).toDecimalPlaces(2, Decimal.ROUND_DOWN);
    if (cashback.lessThanOrEqualTo(0)) return null;

    const newBalance = new Decimal(customer.walletBalance).add(cashback);
    const newCashback = new Decimal(customer.walletCashback).add(cashback);

    const tx = await prisma.$transaction(async (tx) => {
      await tx.customer.update({
        where: { id: customerId },
        data: { walletBalance: newBalance, walletCashback: newCashback },
      });
      const record = await tx.walletTransaction.create({
        data: {
          customerId,
          storeId,
          type: 'CASHBACK',
          amount: cashback,
          balanceAfter: newBalance,
          orderId,
          reference: `Cashback reward for order`,
          notes: `${ratePct}% cashback on order total`,
        },
      });
      return record;
    });

    return tx;
  }

  async getStats(storeId: string | undefined) {
    const customerWhere = storeId ? { storeId } : {};
    const txWhere = storeId ? { storeId } : {};

    const [totalBalance, totalCashback, txAgg, txCount, topHolders] = await Promise.all([
      prisma.customer.aggregate({
        where: customerWhere,
        _sum: { walletBalance: true },
      }),
      prisma.customer.aggregate({
        where: customerWhere,
        _sum: { walletCashback: true },
      }),
      prisma.walletTransaction.aggregate({
        where: { ...txWhere, type: { in: ['PAYMENT', 'WITHDRAWAL'] } },
        _sum: { amount: true },
      }),
      prisma.walletTransaction.count({ where: txWhere }),
      prisma.customer.findMany({
        where: { ...customerWhere, walletBalance: { gt: 0 } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          walletBalance: true,
          walletCashback: true,
        },
        orderBy: { walletBalance: 'desc' },
        take: 10,
      }),
    ]);

    return {
      totalBalance: totalBalance._sum.walletBalance || 0,
      totalCashback: totalCashback._sum.walletCashback || 0,
      totalPaidOut: Math.abs((txAgg._sum.amount || 0) as any) || 0,
      totalTransactions: txCount,
      topHolders,
    };
  }
}

export const walletService = new WalletService();
