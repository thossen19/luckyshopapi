import prisma from '../config/database';
import { NotFoundError, BadRequestError } from '../utils/response';

export class InventoryService {
  async getStock(storeId: string, productId?: string, warehouseId?: string) {
    const where: any = {};
    if (productId) where.productId = productId;
    if (warehouseId) where.warehouseId = warehouseId;

    const inventory = await prisma.inventory.findMany({
      where,
      include: {
        warehouse: { select: { id: true, name: true } },
        product: { select: { id: true, name: true, sku: true } },
        variant: { select: { id: true, name: true, sku: true } },
      },
    });
    return inventory;
  }

  async adjustStock(storeId: string, data: {
    warehouseId: string;
    productId?: string;
    variantId?: string;
    quantity: number;
    type: string;
    notes?: string;
    createdBy?: string;
  }) {
    const warehouse = await prisma.warehouse.findFirst({
      where: { id: data.warehouseId, storeId },
    });
    if (!warehouse) throw new NotFoundError('Warehouse');

    // Find or create inventory record
    let inventory = await prisma.inventory.findFirst({
      where: {
        warehouseId: data.warehouseId,
        productId: data.productId || null,
        variantId: data.variantId || null,
      },
    });

    if (!inventory) {
      inventory = await prisma.inventory.create({
        data: {
          warehouseId: data.warehouseId,
          productId: data.productId || null,
          variantId: data.variantId || null,
          quantity: 0,
          reservedQty: 0,
          availableQty: 0,
        },
      });
    }

    const newQuantity = inventory.quantity + data.quantity;
    if (newQuantity < 0) throw new BadRequestError('Insufficient stock for adjustment');

    await prisma.inventory.update({
      where: { id: inventory.id },
      data: {
        quantity: newQuantity,
        availableQty: newQuantity - inventory.reservedQty,
      },
    });

    // Log transaction
    await prisma.inventoryTransaction.create({
      data: {
        warehouseId: data.warehouseId,
        productId: data.productId || null,
        variantId: data.variantId || null,
        type: data.type as any,
        quantity: data.quantity,
        notes: data.notes,
        createdBy: data.createdBy,
      },
    });

    // Update product/variant stock
    if (data.productId) {
      const totalStock = await prisma.inventory.aggregate({
        where: { productId: data.productId },
        _sum: { quantity: true },
      });
      await prisma.product.update({
        where: { id: data.productId },
        data: { stockQuantity: totalStock._sum.quantity || 0 },
      });
    }

    if (data.variantId) {
      const totalStock = await prisma.inventory.aggregate({
        where: { variantId: data.variantId },
        _sum: { quantity: true },
      });
      await prisma.productVariant.update({
        where: { id: data.variantId },
        data: { stockQuantity: totalStock._sum.quantity || 0 },
      });
    }

    return { message: 'Stock adjusted', newQuantity };
  }

  async getTransactions(storeId: string, filters: any) {
    const where: any = {};
    if (filters.warehouseId) where.warehouseId = filters.warehouseId;
    if (filters.productId) where.productId = filters.productId;
    if (filters.type) where.type = filters.type;

    return prisma.inventoryTransaction.findMany({
      where,
      include: {
        warehouse: { select: { name: true } },
        product: { select: { name: true } },
        variant: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getLowStock(storeId: string) {
    return prisma.product.findMany({
      where: {
        storeId,
        deletedAt: null,
        status: 'ACTIVE',
        trackInventory: true,
        stockQuantity: { lte: prisma.product.fields.lowStockThreshold as any },
      },
      select: {
        id: true, name: true, sku: true, stockQuantity: true,
        lowStockThreshold: true,
        images: { take: 1, select: { url: true } },
      },
    });
  }

  async getStockValue(storeId: string) {
    const inventory = await prisma.inventory.findMany({
      where: { product: { storeId } },
      include: {
        product: { select: { costPrice: true, price: true } },
        variant: { select: { costPrice: true, price: true } },
      },
    });

    let totalCostValue = 0;
    let totalRetailValue = 0;

    for (const inv of inventory) {
      const cost = inv.costPrice || inv.product?.costPrice || inv.variant?.costPrice || 0;
      const price = inv.product?.price || inv.variant?.price || 0;
      totalCostValue += Number(cost) * inv.quantity;
      totalRetailValue += Number(price) * inv.quantity;
    }

    return { totalCostValue, totalRetailValue, itemCount: inventory.length };
  }
}

export const inventoryService = new InventoryService();
