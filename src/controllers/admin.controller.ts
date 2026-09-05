import { Response } from 'express';
import { customerService } from '../services/customer.service';
import { inventoryService } from '../services/inventory.service';
import { supplierService } from '../services/supplier.service';
import { purchaseService } from '../services/purchase.service';
import { couponService } from '../services/coupon.service';
import { promotionService } from '../services/promotion.service';
import { reviewService } from '../services/review.service';
import { analyticsService } from '../services/analytics.service';
import { aiService } from '../services/ai/ai.service';
import { subscriptionService } from '../services/subscription.service';
import { notificationService } from '../services/notification.service';
import { loyaltyService } from '../services/loyalty.service';
import { walletService } from '../services/wallet.service';
import { wishlistService } from '../services/wishlist.service';
import { expenseService } from '../services/expense.service';
import { dashboardService } from '../services/dashboard.service';
import { storeService } from '../services/store.service';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { sendSuccess, sendPaginated, BadRequestError, NotFoundError } from '../utils/response';

// Customer Controller
export class CustomerController {
  async findAll(req: AuthRequest, res: Response) {
    // SUPER_ADMIN can query any store via query param
    const storeId = req.user!.role === 'SUPER_ADMIN' 
      ? (req.query.storeId as string) || undefined 
      : (req as any).storeId || req.user!.storeId;
    const result = await customerService.findAll(storeId!, req.query);
    sendPaginated(res, result.data, result.total, result.page, result.limit);
  }
  async findById(req: AuthRequest, res: Response) {
    const storeId = req.user!.role === 'SUPER_ADMIN' 
      ? (req.query.storeId as string) || undefined 
      : (req as any).storeId || req.user!.storeId;
    const customer = await customerService.findById(storeId!, req.params.id);
    sendSuccess(res, customer);
  }
  async create(req: AuthRequest, res: Response) {
    const storeId = req.user!.role === 'SUPER_ADMIN' 
      ? (req.body.storeId || (req as any).storeId || req.user!.storeId)
      : (req as any).storeId || req.user!.storeId;
    const customer = await customerService.create(storeId!, req.body);
    sendSuccess(res, customer, 'Customer created', 201);
  }
  async update(req: AuthRequest, res: Response) {
    const storeId = req.user!.role === 'SUPER_ADMIN' 
      ? (req.query.storeId as string) || undefined 
      : (req as any).storeId || req.user!.storeId;
    const customer = await customerService.update(storeId!, req.params.id, req.body);
    sendSuccess(res, customer, 'Customer updated');
  }
  async addAddress(req: AuthRequest, res: Response) {
    const storeId = req.user!.role === 'SUPER_ADMIN' 
      ? (req.query.storeId as string) || undefined 
      : (req as any).storeId || req.user!.storeId;
    const address = await customerService.addAddress(storeId!, req.params.id, req.body);
    sendSuccess(res, address, 'Address added', 201);
  }
  async getStats(req: AuthRequest, res: Response) {
    const storeId = req.user!.role === 'SUPER_ADMIN' 
      ? (req.query.storeId as string) || undefined 
      : (req as any).storeId || req.user!.storeId;
    const stats = await customerService.getStats(storeId!);
    sendSuccess(res, stats);
  }
  async getSegments(req: AuthRequest, res: Response) {
    const storeId = req.user!.role === 'SUPER_ADMIN' 
      ? (req.query.storeId as string) || undefined 
      : (req as any).storeId || req.user!.storeId;
    const segments = await customerService.getSegments(storeId!);
    sendSuccess(res, segments);
  }
}

// Inventory Controller
export class InventoryController {
  async getStock(req: AuthRequest, res: Response) {
    const stock = await inventoryService.getStock(
      (req as any).storeId || req.user!.storeId,
      req.query.productId as string,
      req.query.warehouseId as string
    );
    sendSuccess(res, stock);
  }
  async adjustStock(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const result = await inventoryService.adjustStock(storeId!, { ...req.body, createdBy: req.user?.id });
    sendSuccess(res, result, 'Stock adjusted');
  }
  async getTransactions(req: AuthRequest, res: Response) {
    const transactions = await inventoryService.getTransactions(
      (req as any).storeId || req.user!.storeId,
      req.query
    );
    sendSuccess(res, transactions);
  }
  async getLowStock(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const products = await inventoryService.getLowStock(storeId!);
    sendSuccess(res, products);
  }
  async getStockValue(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const value = await inventoryService.getStockValue(storeId!);
    sendSuccess(res, value);
  }
}

// Supplier Controller
export class SupplierController {
  async findAll(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const suppliers = await supplierService.findAll(storeId!);
    sendSuccess(res, suppliers);
  }
  async findById(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const supplier = await supplierService.findById(storeId!, req.params.id);
    sendSuccess(res, supplier);
  }
  async create(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const supplier = await supplierService.create(storeId!, req.body);
    sendSuccess(res, supplier, 'Supplier created', 201);
  }
  async update(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const supplier = await supplierService.update(storeId!, req.params.id, req.body);
    sendSuccess(res, supplier, 'Supplier updated');
  }
  async delete(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    await supplierService.delete(storeId!, req.params.id);
    sendSuccess(res, null, 'Supplier deleted');
  }
}

// Purchase Controller
export class PurchaseController {
  async findAll(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const purchases = await purchaseService.findAll(storeId!, req.query);
    sendSuccess(res, purchases);
  }
  async findById(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const purchase = await purchaseService.findById(storeId!, req.params.id);
    sendSuccess(res, purchase);
  }
  async create(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const purchase = await purchaseService.create(storeId!, req.body);
    sendSuccess(res, purchase, 'Purchase order created', 201);
  }
  async receive(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const result = await purchaseService.receive(storeId!, req.params.id, req.body.items);
    sendSuccess(res, result, 'Items received');
  }
}

// Coupon Controller
export class CouponController {
  async findAll(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const coupons = await couponService.findAll(storeId!);
    sendSuccess(res, coupons);
  }
  async create(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const coupon = await couponService.create(storeId!, req.body);
    sendSuccess(res, coupon, 'Coupon created', 201);
  }
  async update(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const coupon = await couponService.update(storeId!, req.params.id, req.body);
    sendSuccess(res, coupon, 'Coupon updated');
  }
  async delete(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    await couponService.delete(storeId!, req.params.id);
    sendSuccess(res, null, 'Coupon deleted');
  }
  async validate(req: AuthRequest, res: Response) {
    const storeId = req.body.storeId || (req as any).storeId || req.user!.storeId;
    const result = await couponService.validate(storeId, req.body.code, req.body.cartTotal);
    sendSuccess(res, result);
  }
}

  // Promotion Controller
  export class PromotionController {
    async findAll(req: AuthRequest, res: Response) {
      const storeId = req.user!.role === 'SUPER_ADMIN' 
        ? (req.query.storeId as string) || undefined 
        : (req as any).storeId || req.user!.storeId;
      const promos = await promotionService.findAll(storeId);
      sendSuccess(res, promos);
    }
    async create(req: AuthRequest, res: Response) {
      let storeId = req.user!.role === 'SUPER_ADMIN'
        ? (req.body.storeId || (req as any).storeId || req.user!.storeId)
        : (req as any).storeId || req.user!.storeId;
      // Fall back to the first active store when none is associated
      // (e.g. SUPER_ADMIN users without a storeId)
      if (!storeId) {
        const firstStore = await prisma.store.findFirst({
          where: { isActive: true },
          select: { id: true },
        });
        if (!firstStore) throw new NotFoundError('No active store found');
        storeId = firstStore.id;
      }
      const promo = await promotionService.create(storeId, req.body);
      sendSuccess(res, promo, 'Promotion created', 201);
    }
    async update(req: AuthRequest, res: Response) {
      const storeId = req.user!.role === 'SUPER_ADMIN' 
        ? (req.query.storeId as string) || undefined 
        : (req as any).storeId || req.user!.storeId;
      const promo = await promotionService.update(storeId!, req.params.id, req.body);
      sendSuccess(res, promo, 'Promotion updated');
    }
    async delete(req: AuthRequest, res: Response) {
      const storeId = req.user!.role === 'SUPER_ADMIN' 
        ? (req.query.storeId as string) || undefined 
        : (req as any).storeId || req.user!.storeId;
      await promotionService.delete(storeId!, req.params.id);
      sendSuccess(res, null, 'Promotion deleted');
    }
  }

// Review Controller
async function resolveCustomerForUser(storeId: string | undefined, user: { id: string }) {
  if (!storeId) {
    const firstStore = await prisma.store.findFirst({ where: { isActive: true }, select: { id: true } });
    if (!firstStore) return null;
    storeId = firstStore.id;
  }
  const userRecord = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, email: true, firstName: true, lastName: true, phone: true },
  });
  if (!userRecord) return null;
  let customer = await prisma.customer.findUnique({
    where: { email_storeId: { email: userRecord.email, storeId } },
  });
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        email: userRecord.email,
        firstName: userRecord.firstName,
        lastName: userRecord.lastName,
        phone: userRecord.phone ?? undefined,
        storeId,
        isActive: true,
      },
    });
  }
  return { customer, storeId };
}

export class ReviewController {
  async findByProduct(req: AuthRequest, res: Response) {
    const storeId = req.query.storeId as string || (req as any).storeId;
    const result = await reviewService.findByProduct(storeId, req.params.productId, req.query);
    sendPaginated(res, result.data, result.total, result.page, result.limit);
  }
  async findMine(req: AuthRequest, res: Response) {
    const productId = req.query.productId as string;
    if (!productId) {
      return sendSuccess(res, null, 'productId is required');
    }
    const resolved = await resolveCustomerForUser((req as any).storeId || req.user!.storeId, req.user!);
    if (!resolved) return sendSuccess(res, null);
    const { customer, storeId } = resolved;
    const review = await prisma.review.findFirst({
      where: { productId, customerId: customer.id, storeId },
    });
    sendSuccess(res, review);
  }
  async findMyReviews(req: AuthRequest, res: Response) {
    const resolved = await resolveCustomerForUser((req as any).storeId || req.user!.storeId, req.user!);
    if (!resolved) return sendSuccess(res, []);
    const { customer, storeId } = resolved;
    const reviews = await prisma.review.findMany({
      where: { customerId: customer.id, storeId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: { take: 1, orderBy: { sortOrder: 'asc' } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, reviews);
  }
  async create(req: AuthRequest, res: Response) {
    const resolved = await resolveCustomerForUser((req as any).storeId || req.user!.storeId, req.user!);
    if (!resolved) throw new BadRequestError('Unable to resolve customer for this user');
    const { customer, storeId } = resolved;
    const review = await reviewService.create(storeId, customer.id, req.body);
    sendSuccess(res, review, 'Review submitted', 201);
  }
  async update(req: AuthRequest, res: Response) {
    const resolved = await resolveCustomerForUser((req as any).storeId || req.user!.storeId, req.user!);
    if (!resolved) throw new BadRequestError('Unable to resolve customer for this user');
    const { customer, storeId } = resolved;
    const updated = await reviewService.update(storeId, req.params.id, customer.id, req.body);
    sendSuccess(res, updated, 'Review updated');
  }
  async remove(req: AuthRequest, res: Response) {
    const resolved = await resolveCustomerForUser((req as any).storeId || req.user!.storeId, req.user!);
    if (!resolved) throw new BadRequestError('Unable to resolve customer for this user');
    const { customer, storeId } = resolved;
    await reviewService.remove(storeId, req.params.id, customer.id);
    sendSuccess(res, null, 'Review deleted');
  }
  async updateStatus(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const review = await reviewService.updateStatus(storeId!, req.params.id, req.body.status);
    sendSuccess(res, review, 'Review updated');
  }
  async respond(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const review = await reviewService.respond(storeId!, req.params.id, req.body.response);
    sendSuccess(res, review, 'Response added');
  }
}

// Analytics Controller
export class AnalyticsController {
  async getSalesReport(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const report = await analyticsService.getSalesReport(storeId!, req.query.startDate as string, req.query.endDate as string);
    sendSuccess(res, report);
  }
  async getProductPerformance(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const performance = await analyticsService.getProductPerformance(storeId!);
    sendSuccess(res, performance);
  }
  async getConversionFunnel(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const funnel = await analyticsService.getConversionFunnel(storeId!, req.query.startDate as string, req.query.endDate as string);
    sendSuccess(res, funnel);
  }
  async trackEvent(req: AuthRequest, res: Response) {
    const storeId = req.body.storeId || (req as any).storeId;
    const event = await analyticsService.trackEvent(storeId, { ...req.body, ip: req.ip });
    sendSuccess(res, event, 'Event tracked', 201);
  }
}

// AI Controller
export class AiController {
  async generateProductDescription(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const result = await aiService.generateProductDescription(storeId!, req.body);
    sendSuccess(res, result);
  }
  async generateSeoContent(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const result = await aiService.generateSeoContent(storeId!, req.body);
    sendSuccess(res, result);
  }
  async generateProductContent(req: AuthRequest, res: Response) {
    const result = await aiService.generateProductContent(req.body);
    sendSuccess(res, result);
  }
  async chatAssistant(req: AuthRequest, res: Response) {
    const storeId = req.body.storeId || (req as any).storeId;
    const result = await aiService.chatAssistant(storeId, req.body.messages, req.body.context);
    sendSuccess(res, result);
  }
  async getInsights(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const insights = await aiService.getInsights(storeId!);
    sendSuccess(res, insights);
  }
}

// Subscription Controller
export class SubscriptionController {
  async getPlans(req: AuthRequest, res: Response) {
    const plans = await subscriptionService.getPlans();
    sendSuccess(res, plans);
  }
  async getMySubscription(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const sub = await subscriptionService.getStoreSubscription(storeId!);
    sendSuccess(res, sub);
  }
  async subscribe(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const sub = await subscriptionService.subscribe(storeId!, req.body.planId);
    sendSuccess(res, sub, 'Subscribed successfully');
  }
  async cancel(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const sub = await subscriptionService.cancel(storeId!);
    sendSuccess(res, sub, 'Subscription cancelled');
  }
  async checkLimits(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const limits = await subscriptionService.checkLimits(storeId!);
    sendSuccess(res, limits);
  }
}

// Notification Controller
export class NotificationController {
  async findAll(req: AuthRequest, res: Response) {
    const notifications = await notificationService.findAll(req.user!.id, req.user!.storeId ?? undefined);
    sendSuccess(res, notifications);
  }
  async markAsRead(req: AuthRequest, res: Response) {
    await notificationService.markAsRead(req.params.id, req.user!.id);
    sendSuccess(res, null, 'Marked as read');
  }
  async markAllAsRead(req: AuthRequest, res: Response) {
    await notificationService.markAllAsRead(req.user!.id);
    sendSuccess(res, null, 'All marked as read');
  }
  async getUnreadCount(req: AuthRequest, res: Response) {
    const result = await notificationService.getUnreadCount(req.user!.id);
    sendSuccess(res, result);
  }
}

// Loyalty Controller
export class LoyaltyController {
  async getBalance(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const result = await loyaltyService.getBalance(storeId!, req.params.customerId);
    sendSuccess(res, result);
  }
  async getHistory(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const history = await loyaltyService.getHistory(storeId!, req.params.customerId);
    sendSuccess(res, history);
  }
  async earnPoints(req: AuthRequest, res: Response) {
    const result = await loyaltyService.earnPoints(req.params.customerId, req.body.points, req.body.reference, req.body.notes);
    sendSuccess(res, result, 'Points earned');
  }
  async redeemPoints(req: AuthRequest, res: Response) {
    const result = await loyaltyService.redeemPoints(req.params.customerId, req.body.points, req.body.reference);
    sendSuccess(res, result, 'Points redeemed');
  }
}

// Wallet Controller
export class WalletController {
  // Storefront: current logged-in customer's own wallet + transactions
  async me(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const resolved = storeId
      ? await resolveCustomerForUser(storeId, req.user!)
      : await resolveCustomerForUser(undefined, req.user!);
    if (!resolved) return sendSuccess(res, null);
    const balance = await walletService.getBalance(resolved.storeId, resolved.customer.id);
    sendSuccess(res, balance);
  }
  async myTransactions(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const resolved = storeId
      ? await resolveCustomerForUser(storeId, req.user!)
      : await resolveCustomerForUser(undefined, req.user!);
    if (!resolved) return sendSuccess(res, { data: [], total: 0, page: 1, limit: 20 });
    const tx = await walletService.getTransactions(resolved.storeId, resolved.customer.id, req.query);
    sendPaginated(res, tx.data, tx.total, tx.page, tx.limit);
  }
  async getBalance(req: AuthRequest, res: Response) {
    const storeId = req.user!.role === 'SUPER_ADMIN'
      ? (req.query.storeId as string) || undefined
      : (req as any).storeId || req.user!.storeId;
    const balance = await walletService.getBalance(storeId, req.params.customerId);
    sendSuccess(res, balance);
  }
  async getTransactions(req: AuthRequest, res: Response) {
    const storeId = req.user!.role === 'SUPER_ADMIN'
      ? (req.query.storeId as string) || undefined
      : (req as any).storeId || req.user!.storeId;
    const tx = await walletService.getTransactions(storeId, req.params.customerId, req.query);
    sendPaginated(res, tx.data, tx.total, tx.page, tx.limit);
  }
  async topUp(req: AuthRequest, res: Response) {
    const storeId = req.user!.role === 'SUPER_ADMIN'
      ? (req.query.storeId as string) || req.body.storeId || (req as any).storeId
      : (req as any).storeId || req.user!.storeId;
    const record = await walletService.credit(
      storeId!,
      req.params.customerId,
      req.body.amount,
      'TOPUP',
      { reference: req.body.reference, notes: req.body.notes || 'Wallet top up', createdById: req.user!.id }
    );
    sendSuccess(res, record, 'Wallet topped up');
  }
  async adjust(req: AuthRequest, res: Response) {
    const storeId = req.user!.role === 'SUPER_ADMIN'
      ? (req.query.storeId as string) || req.body.storeId || (req as any).storeId
      : (req as any).storeId || req.user!.storeId;
    const amount = Number(req.body.amount);
    let record;
    if (amount >= 0) {
      record = await walletService.credit(
        storeId!,
        req.params.customerId,
        Math.abs(amount),
        'ADJUSTMENT',
        { reference: req.body.reference, notes: req.body.notes || 'Wallet adjustment', createdById: req.user!.id }
      );
    } else {
      record = await walletService.debit(
        storeId!,
        req.params.customerId,
        Math.abs(amount),
        'ADJUSTMENT',
        { reference: req.body.reference, notes: req.body.notes || 'Wallet adjustment', createdById: req.user!.id }
      );
    }
    sendSuccess(res, record, 'Wallet adjusted');
  }
  async getStats(req: AuthRequest, res: Response) {
    const storeId = req.user!.role === 'SUPER_ADMIN'
      ? (req.query.storeId as string) || undefined
      : (req as any).storeId || req.user!.storeId;
    const stats = await walletService.getStats(storeId);
    sendSuccess(res, stats);
  }
}

// Address Controller (customer's own addresses)
export class AddressController {
  async list(req: AuthRequest, res: Response) {
    const resolved = await resolveCustomerForUser((req as any).storeId || req.user!.storeId, req.user!);
    if (!resolved) return sendSuccess(res, []);
    const addresses = await prisma.address.findMany({
      where: { customerId: resolved.customer.id },
    });
    sendSuccess(res, addresses);
  }

  async create(req: AuthRequest, res: Response) {
    const resolved = await resolveCustomerForUser((req as any).storeId || req.user!.storeId, req.user!);
    if (!resolved) throw new BadRequestError('Unable to resolve customer for this user');
    const customerId = resolved.customer.id;
    const data = req.body;
    const count = await prisma.address.count({ where: { customerId } });
    const isFirst = count === 0;
    let isDefault = data.isDefault ?? isFirst;
    if (data.isDefault || isFirst) {
      await prisma.address.updateMany({ where: { customerId }, data: { isDefault: false } });
    }
    const address = await prisma.address.create({
      data: {
        customerId,
        firstName: data.firstName ?? resolved.customer.firstName ?? '',
        lastName: data.lastName ?? resolved.customer.lastName ?? '',
        address1: data.address1,
        address2: data.address2,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country ?? 'US',
        phone: data.phone,
        isDefault,
      },
    });
    sendSuccess(res, address, 'Address added', 201);
  }

  async update(req: AuthRequest, res: Response) {
    const resolved = await resolveCustomerForUser((req as any).storeId || req.user!.storeId, req.user!);
    if (!resolved) throw new BadRequestError('Unable to resolve customer for this user');
    const existing = await prisma.address.findFirst({
      where: { id: req.params.id, customerId: resolved.customer.id },
    });
    if (!existing) throw new NotFoundError('Address');
    const data = req.body;
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { customerId: resolved.customer.id },
        data: { isDefault: false },
      });
    }
    const address = await prisma.address.update({
      where: { id: existing.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        address1: data.address1,
        address2: data.address2,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        phone: data.phone,
        isDefault: data.isDefault,
      },
    });
    sendSuccess(res, address, 'Address updated');
  }

  async setDefault(req: AuthRequest, res: Response) {
    const resolved = await resolveCustomerForUser((req as any).storeId || req.user!.storeId, req.user!);
    if (!resolved) throw new BadRequestError('Unable to resolve customer for this user');
    const existing = await prisma.address.findFirst({
      where: { id: req.params.id, customerId: resolved.customer.id },
    });
    if (!existing) throw new NotFoundError('Address');
    await prisma.$transaction([
      prisma.address.updateMany({
        where: { customerId: resolved.customer.id },
        data: { isDefault: false },
      }),
      prisma.address.update({ where: { id: existing.id }, data: { isDefault: true } }),
    ]);
    sendSuccess(res, null, 'Default address updated');
  }

  async remove(req: AuthRequest, res: Response) {
    const resolved = await resolveCustomerForUser((req as any).storeId || req.user!.storeId, req.user!);
    if (!resolved) throw new BadRequestError('Unable to resolve customer for this user');
    const existing = await prisma.address.findFirst({
      where: { id: req.params.id, customerId: resolved.customer.id },
    });
    if (!existing) throw new NotFoundError('Address');
    await prisma.address.delete({ where: { id: existing.id } });
    sendSuccess(res, null, 'Address deleted');
  }
}

// Wishlist Controller
export class WishlistController {
  async getWishlist(req: AuthRequest, res: Response) {
    const storeId = req.query.storeId as string || (req as any).storeId;
    const wishlist = await wishlistService.getWishlist(storeId, req.user!.id);
    sendSuccess(res, wishlist);
  }
  async addItem(req: AuthRequest, res: Response) {
    const storeId = req.body.storeId || (req as any).storeId;
    const item = await wishlistService.addItem(storeId, req.user!.id, req.body.productId);
    sendSuccess(res, item, 'Added to wishlist', 201);
  }
  async removeItem(req: AuthRequest, res: Response) {
    await wishlistService.removeItem(req.user!.id, req.params.productId);
    sendSuccess(res, null, 'Removed from wishlist');
  }
  async checkItem(req: AuthRequest, res: Response) {
    const result = await wishlistService.isInWishlist(req.user!.id, req.params.productId);
    sendSuccess(res, result);
  }
}

// Expense Controller
export class ExpenseController {
  async findAll(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const expenses = await expenseService.findAll(storeId!, req.query);
    sendSuccess(res, expenses);
  }
  async create(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const expense = await expenseService.create(storeId!, { ...req.body, createdBy: req.user?.id });
    sendSuccess(res, expense, 'Expense created', 201);
  }
  async update(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const expense = await expenseService.update(storeId!, req.params.id, req.body);
    sendSuccess(res, expense, 'Expense updated');
  }
  async delete(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    await expenseService.delete(storeId!, req.params.id);
    sendSuccess(res, null, 'Expense deleted');
  }
  async getSummary(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const summary = await expenseService.getSummary(storeId!, req.query.startDate as string, req.query.endDate as string);
    sendSuccess(res, summary);
  }
  async getProfitLoss(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const pl = await expenseService.getProfitLoss(storeId!, req.query.startDate as string, req.query.endDate as string);
    sendSuccess(res, pl);
  }
}

// Dashboard Controller
export class DashboardController {
  async getMetrics(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const metrics = await dashboardService.getMetrics(storeId!);
    sendSuccess(res, metrics);
  }
  async getRevenueChart(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user!.storeId;
    const chart = await dashboardService.getRevenueChart(storeId!, req.query.period as string);
    sendSuccess(res, chart);
  }
}

// Store Controller
export class StoreController {
  async findById(req: AuthRequest, res: Response) {
    const store = await storeService.findById(req.params.id);
    sendSuccess(res, store);
  }
  async findBySlug(req: AuthRequest, res: Response) {
    const store = await storeService.findBySlug(req.params.slug);
    sendSuccess(res, store);
  }
  async createStorefront(req: AuthRequest, res: Response) {
    const store = await storeService.create(req.body, req.user!.id);
    sendSuccess(res, store, 'Store created', 201);
  }
  async updateStore(req: AuthRequest, res: Response) {
    if (!req.params.id) throw new BadRequestError('Store ID is required');
    const store = await storeService.update(req.params.id, req.body);
    sendSuccess(res, store, 'Store updated');
  }
  async updateSettings(req: AuthRequest, res: Response) {
    // SUPER_ADMIN updates any store by :id; store owners update their own store.
    const storeId =
      req.user!.role === 'SUPER_ADMIN'
        ? req.params.id
        : (req as any).storeId || req.user!.storeId;
    if (!storeId) throw new BadRequestError('No store associated with this account');
    const settings = await storeService.updateSettings(storeId, req.body);
    sendSuccess(res, settings, 'Settings updated');
  }
  async getStorefront(req: AuthRequest, res: Response) {
    const data = await storeService.getStorefrontData(req.params.slug);
    sendSuccess(res, data);
  }

  async getBranding(req: AuthRequest, res: Response) {
    const data = await storeService.getBrandingData(req.params.slug);
    sendSuccess(res, data);
  }

  async getAllStores(req: AuthRequest, res: Response) {
    const stores = await storeService.getAllStores();
    sendSuccess(res, stores);
  }
}