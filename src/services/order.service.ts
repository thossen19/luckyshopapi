import prisma from '../config/database';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/response';
import { parsePagination, generateSlug, generateOrderNumber, generateInvoiceNumber } from '../utils/helpers';
import { Decimal } from '@prisma/client/runtime/library';
import { walletService } from './wallet.service';

export class OrderService {
  async findAll(storeId: string | undefined, filters: any) {
    const { page, limit, skip } = parsePagination(filters.page, filters.limit);
    const where: any = {};

    // If no storeId (SUPER_ADMIN), show all orders
    if (storeId) {
      where.storeId = storeId;
    }

    if (filters.status) where.status = filters.status;
    if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;
    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }
    if (filters.search) {
      where.OR = [
        { orderNumber: { contains: filters.search } },
        { customer: { email: { contains: filters.search } } },
        { customer: { firstName: { contains: filters.search } } },
        { customer: { lastName: { contains: filters.search } } },
        { shippingFirstName: { contains: filters.search } },
        { shippingLastName: { contains: filters.search } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: { select: { id: true, firstName: true, lastName: true, email: true } },
          items: {
            include: {
              product: { select: { name: true, images: { take: 1 } } },
            },
          },
          payments: true,
          store: { select: { id: true, name: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    return { data: orders, total, page, limit };
  }

  async findAllByUser(userId: string, filters: any) {
    const { page, limit, skip } = parsePagination(filters.page, filters.limit);
    
    const where: any = { userId };
    if (filters.status) where.status = filters.status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: { select: { name: true, images: { take: 1 }, slug: true } },
            },
          },
          payments: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    return { data: orders, total, page, limit };
  }

  async findById(storeId: string | undefined, id: string) {
    const where: any = { id };
    if (storeId) where.storeId = storeId;
    
    const order = await prisma.order.findFirst({
      where,
      include: {
        customer: true,
        items: {
          include: {
            product: { select: { name: true, images: { take: 1 }, slug: true } },
            variant: true,
          },
        },
        payments: true,
        refunds: true,
        shipments: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
        store: { select: { id: true, name: true } },
      },
    });
    if (!order) throw new NotFoundError('Order');
    return order;
  }

  async create(storeId: string, data: any) {
    // Validate products and calculate totals
    let subtotal = new Decimal(0);
    const orderItems = [];

    for (const item of data.items) {
      const product = await prisma.product.findFirst({
        where: { id: item.productId, storeId, deletedAt: null, status: 'ACTIVE' },
        include: { variants: true },
      });
      if (!product) throw new NotFoundError(`Product ${item.productId}`);

      let unitPrice = product.salePrice || product.price;
      let variant = null;

      if (item.variantId) {
        variant = product.variants.find((v) => v.id === item.variantId);
        if (!variant) throw new NotFoundError(`Variant ${item.variantId}`);
        unitPrice = variant.salePrice || variant.price;
      }

      // Check stock
      if (product.trackInventory) {
        if (item.variantId) {
          if (variant!.stockQuantity < item.quantity) {
            throw new BadRequestError(`Insufficient stock for ${product.name} (${variant!.name})`);
          }
        } else {
          if (product.stockQuantity < item.quantity) {
            throw new BadRequestError(`Insufficient stock for ${product.name}`);
          }
        }
      }

      const itemTotal = unitPrice.mul(item.quantity);
      subtotal = subtotal.add(itemTotal);

      orderItems.push({
        productId: product.id,
        variantId: item.variantId || null,
        productName: product.name,
        variantName: variant?.name || null,
        sku: variant?.sku || product.sku,
        quantity: item.quantity,
        unitPrice,
        totalPrice: itemTotal,
        taxRate: product.taxRate || 0,
        taxAmount: itemTotal.mul(product.taxRate || 0).div(100),
      });
    }

    // Apply coupon
    let discountAmount = new Decimal(0);
    if (data.couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: { code: data.couponCode, storeId, isActive: true },
      });
      if (coupon) {
        if (coupon.discountType === 'PERCENTAGE') {
          discountAmount = subtotal.mul(coupon.discountValue).div(100);
          if (coupon.maximumDiscount && discountAmount.greaterThan(coupon.maximumDiscount)) {
            discountAmount = coupon.maximumDiscount;
          }
        } else if (coupon.discountType === 'FIXED') {
          discountAmount = Decimal.min(coupon.discountValue, subtotal);
        }
      }
    }

    const taxAmount = orderItems.reduce((sum, item) => sum.add(item.taxAmount), new Decimal(0));
    const shippingAmount = new Decimal(data.shippingAmount || 0);
    const totalAmount = subtotal.add(taxAmount).add(shippingAmount).sub(discountAmount);

    // Resolve customer for wallet payments (find linked customer by user email)
    let resolvedCustomerId = data.customerId || null;
    if (data.paymentMethod === 'wallet' && !resolvedCustomerId && data.userId) {
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { email: true, firstName: true, lastName: true, phone: true },
      });
      if (user && user.email) {
        const customer = await prisma.customer.findFirst({
          where: { storeId, email: user.email },
        });
        if (customer) {
          resolvedCustomerId = customer.id;
        } else {
          const created = await prisma.customer.create({
            data: {
              storeId,
              email: user.email,
              firstName: user.firstName || 'Wallet',
              lastName: user.lastName || 'User',
              phone: user.phone,
            },
          });
          resolvedCustomerId = created.id;
        }
      }
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        storeId,
        customerId: resolvedCustomerId,
        userId: data.userId || null,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        subtotal,
        taxAmount,
        shippingAmount,
        discountAmount,
        totalAmount,
        currency: data.currency || 'USD',
        couponCode: data.couponCode || null,
        shippingFirstName: data.shippingAddress?.firstName,
        shippingLastName: data.shippingAddress?.lastName,
        shippingAddress1: data.shippingAddress?.address1,
        shippingAddress2: data.shippingAddress?.address2,
        shippingCity: data.shippingAddress?.city,
        shippingState: data.shippingAddress?.state,
        shippingZipCode: data.shippingAddress?.zipCode,
        shippingCountry: data.shippingAddress?.country,
        shippingPhone: data.shippingAddress?.phone,
        billingFirstName: data.billingAddress?.firstName,
        billingLastName: data.billingAddress?.lastName,
        billingAddress1: data.billingAddress?.address1,
        billingCity: data.billingAddress?.city,
        billingState: data.billingAddress?.state,
        billingZipCode: data.billingAddress?.zipCode,
        billingCountry: data.billingAddress?.country,
        shippingMethod: data.shippingMethod,
        customerNote: data.customerNote,
        items: { create: orderItems },
        statusHistory: {
          create: { status: 'PENDING', note: 'Order created' },
        },
      },
      include: {
        items: true,
        statusHistory: true,
      },
    });

    // Update inventory
    for (const item of data.items) {
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      } else {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }
    }

    // Update customer stats
    if (data.customerId) {
      await prisma.customer.update({
        where: { id: data.customerId },
        data: {
          totalOrders: { increment: 1 },
          totalSpent: { increment: totalAmount },
          lastPurchaseAt: new Date(),
        },
      });
    }

    // Update coupon usage
    if (data.couponCode) {
      await prisma.coupon.updateMany({
        where: { code: data.couponCode, storeId },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Wallet payment: debit balance, record payment, mark paid, award cashback
    if (data.paymentMethod === 'wallet' && order.customerId) {
      await this.processWalletPayment(storeId, order, data);
      const updated = await prisma.order.findUnique({
        where: { id: order.id },
        include: { items: true, payments: true },
      });
      if (updated) return updated;
    }

    return order;
  }

  private async processWalletPayment(storeId: string, order: any, data: any) {
    try {
      // Ensure sufficient balance
      const balance = await walletService.getBalance(storeId, order.customerId);
      const current = new Decimal(balance.walletBalance);
      const total = new Decimal(order.totalAmount);
      if (current.lessThan(total)) {
        throw new BadRequestError('Insufficient wallet balance to complete this order');
      }

      await walletService.debit(
        storeId,
        order.customerId,
        total.toNumber(),
        'PAYMENT',
        { orderId: order.id, reference: `Payment for order ${order.orderNumber}`, notes: 'Order paid with wallet' }
      );

      await prisma.payment.create({
        data: {
          orderId: order.id,
          method: 'wallet',
          amount: total.toNumber(),
          status: 'PAID',
          transactionId: `WAL-${order.orderNumber}`,
          metadata: { source: 'wallet' },
        },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'PAID' },
      });

      // Cashback reward (configurable rate, default 2%)
      const cashbackRate = Number(data.cashbackRate) || 2;
      await walletService.applyCashback(storeId, order.customerId, total.toNumber(), order.id, cashbackRate);
    } catch (error) {
      // If wallet payment fails, keep order PENDING and mark payment FAILED
      await prisma.payment.create({
        data: {
          orderId: order.id,
          method: 'wallet',
          amount: new Decimal(order.totalAmount),
          status: 'FAILED',
          metadata: { source: 'wallet', error: error instanceof Error ? error.message : 'processing failed' },
        },
      }).catch(() => undefined);
      throw error;
    }
  }

  async updateStatus(storeId: string | undefined, id: string, status: string, note?: string, userId?: string) {
    const where: any = { id };
    if (storeId) where.storeId = storeId;
    
    const order = await prisma.order.findFirst({ where });
    if (!order) throw new NotFoundError('Order');

    const validTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['PACKED', 'CANCELLED'],
      PACKED: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED', 'RETURNED'],
      DELIVERED: ['RETURNED', 'REFUNDED'],
      RETURNED: ['REFUNDED'],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      throw new BadRequestError(`Cannot transition from ${order.status} to ${status}`);
    }

    const updateData: any = { status };

    // Update related statuses
    if (status === 'SHIPPED') updateData.fulfillmentStatus = 'FULFILLED';
    if (status === 'DELIVERED') updateData.fulfillmentStatus = 'FULFILLED';
    if (status === 'CANCELLED') {
      updateData.paymentStatus = 'REFUNDED';
      // Restore inventory
      const items = await prisma.orderItem.findMany({ where: { orderId: id } });
      for (const item of items) {
        if (item.variantId) {
          await prisma.productVariant.update({
            where: { id: item.variantId },
            data: { stockQuantity: { increment: item.quantity } },
          });
        } else {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { increment: item.quantity } },
          });
        }
      }
    }
    if (status === 'RETURNED') updateData.fulfillmentStatus = 'RETURNED';

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...updateData,
        statusHistory: {
          create: { status: status as any, note, createdBy: userId },
        },
      },
      include: { statusHistory: { orderBy: { createdAt: 'desc' } } },
    });

    return updatedOrder;
  }

  async addPayment(storeId: string, orderId: string, data: { method: string; amount: number; transactionId?: string }) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, storeId },
    });
    if (!order) throw new NotFoundError('Order');

    const payment = await prisma.payment.create({
      data: {
        orderId,
        method: data.method,
        amount: data.amount,
        status: 'PAID',
        transactionId: data.transactionId,
      },
    });

    // Update payment status
    const totalPaid = await prisma.payment.aggregate({
      where: { orderId, status: 'PAID' },
      _sum: { amount: true },
    });

    const paidAmount = totalPaid._sum.amount || new Decimal(0);
    if (paidAmount.gte(order.totalAmount)) {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID' },
      });
    } else if (paidAmount.greaterThan(0)) {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PARTIALLY_PAID' },
      });
    }

    return payment;
  }

  async addShipment(storeId: string, orderId: string, data: { carrier: string; trackingNumber: string; method?: string }) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, storeId },
    });
    if (!order) throw new NotFoundError('Order');

    return prisma.shipment.create({
      data: {
        orderId,
        carrier: data.carrier,
        trackingNumber: data.trackingNumber,
        method: data.method,
        status: 'IN_TRANSIT',
      },
    });
  }

  async getStats(storeId: string | undefined, startDate?: string, endDate?: string) {
    const where: any = {};
    if (storeId) where.storeId = storeId;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [totalOrders, totalRevenue, averageOrderValue, statusCounts] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.aggregate({ where, _sum: { totalAmount: true } }),
      prisma.order.aggregate({ where, _avg: { totalAmount: true } }),
      prisma.order.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
    ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      averageOrderValue: averageOrderValue._avg.totalAmount || 0,
      byStatus: statusCounts.map((s) => ({ status: s.status, count: s._count })),
    };
  }
}

export const orderService = new OrderService();
