import prisma from '../config/database';
import { NotFoundError, BadRequestError } from '../utils/response';
import { generateSlug } from '../utils/helpers';

export class PurchaseService {
  async findAll(storeId: string, filters?: any) {
    const where: any = { storeId };
    if (filters?.status) where.status = filters.status;
    if (filters?.supplierId) where.supplierId = filters.supplierId;

    return prisma.purchaseOrder.findMany({
      where,
      include: {
        supplier: { select: { name: true } },
        warehouse: { select: { name: true } },
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(storeId: string, id: string) {
    const po = await prisma.purchaseOrder.findFirst({
      where: { id, storeId },
      include: {
        supplier: true,
        warehouse: true,
        items: { include: { product: { select: { name: true, sku: true } } } },
        payments: true,
      },
    });
    if (!po) throw new NotFoundError('Purchase Order');
    return po;
  }

  async create(storeId: string, data: any) {
    const poNumber = `PO-${Date.now().toString(36).toUpperCase()}`;
    const subtotal = data.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);

    return prisma.purchaseOrder.create({
      data: {
        poNumber,
        storeId,
        supplierId: data.supplierId,
        warehouseId: data.warehouseId,
        subtotal,
        totalAmount: subtotal + (data.taxAmount || 0) + (data.shippingAmount || 0),
        taxAmount: data.taxAmount || 0,
        shippingAmount: data.shippingAmount || 0,
        notes: data.notes,
        expectedDate: data.expectedDate,
        items: {
          create: data.items.map((item: any) => ({
            productName: item.productName,
            sku: item.sku,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
          })),
        },
      },
      include: { items: true, supplier: true, warehouse: true },
    });
  }

  async receive(storeId: string, id: string, items: { purchaseItemId: string; receivedQty: number }[]) {
    const po = await prisma.purchaseOrder.findFirst({
      where: { id, storeId },
      include: { items: true, warehouse: true },
    });
    if (!po) throw new NotFoundError('Purchase Order');
    if (po.status === 'CANCELLED' || po.status === 'RECEIVED') throw new BadRequestError('Cannot receive this order');

    for (const item of items) {
      const poItem = po.items.find((i) => i.id === item.purchaseItemId);
      if (!poItem) throw new NotFoundError('Purchase item');

      await prisma.purchaseItem.update({
        where: { id: item.purchaseItemId },
        data: { receivedQty: { increment: item.receivedQty } },
      });

      // Update inventory
      if (poItem.productId) {
        await inventoryService.adjustStock(storeId, {
          warehouseId: po.warehouseId,
          productId: poItem.productId,
          quantity: item.receivedQty,
          type: 'PURCHASE',
          notes: `Received from PO ${po.poNumber}`,
        });
      }
    }

    const allReceived = po.items.every((item) => {
      const updatedItem = items.find((i) => i.purchaseItemId === item.id);
      return (item.receivedQty + (updatedItem?.receivedQty || 0)) >= item.quantity;
    });

    return prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: allReceived ? 'RECEIVED' : 'PARTIALLY_RECEIVED',
        receivedDate: allReceived ? new Date() : undefined,
      },
    });
  }
}

export const purchaseService = new PurchaseService();

// Import at end to avoid circular dependency
import { inventoryService } from './inventory.service';
