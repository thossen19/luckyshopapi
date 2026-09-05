import prisma from '../config/database';

export class NotificationService {
  async findAll(userId: string, storeId?: string) {
    const where: any = { userId };
    if (storeId) where.storeId = storeId;
    return prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async create(data: { storeId?: string; userId?: string; title: string; message: string; type: string; metadata?: any }) {
    return prisma.notification.create({
      data: {
        ...data,
        type: data.type as any,
        channel: 'IN_APP',
      },
    });
  }

  async markAsRead(id: string, userId: string) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { message: 'All notifications marked as read' };
  }

  async getUnreadCount(userId: string) {
    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async sendOrderNotification(storeId: string, orderId: string, event: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true, store: true },
    });
    if (!order) return;

    const templates: Record<string, string> = {
      ORDER_CONFIRMED: `Order ${order.orderNumber} has been confirmed`,
      ORDER_SHIPPED: `Order ${order.orderNumber} has been shipped`,
      ORDER_DELIVERED: `Order ${order.orderNumber} has been delivered`,
      PAYMENT_RECEIVED: `Payment received for order ${order.orderNumber}`,
    };

    await this.create({
      storeId,
      title: templates[event] || 'Order updated',
      message: `Order ${order.orderNumber} status: ${event}`,
      type: 'ORDER',
    });
  }

  async sendLowStockAlert(storeId: string, productName: string, currentStock: number) {
    await this.create({
      storeId,
      title: 'Low Stock Alert',
      message: `${productName} is running low on stock (${currentStock} remaining)`,
      type: 'INVENTORY',
    });
  }

  async getTemplates() {
    return prisma.notificationTemplate.findMany({ orderBy: { name: 'asc' } });
  }

  async updateTemplate(id: string, data: any) {
    return prisma.notificationTemplate.upsert({
      where: { id },
      create: { ...data, id },
      update: data,
    });
  }
}

export const notificationService = new NotificationService();
