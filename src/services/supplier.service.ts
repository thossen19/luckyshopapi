import prisma from '../config/database';
import { NotFoundError } from '../utils/response';

export class SupplierService {
  async findAll(storeId: string) {
    return prisma.supplier.findMany({
      where: { storeId },
      include: { _count: { select: { purchaseOrders: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findById(storeId: string, id: string) {
    const supplier = await prisma.supplier.findFirst({
      where: { id, storeId },
      include: {
        purchaseOrders: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { items: true },
        },
      },
    });
    if (!supplier) throw new NotFoundError('Supplier');
    return supplier;
  }

  async create(storeId: string, data: any) {
    return prisma.supplier.create({ data: { ...data, storeId } });
  }

  async update(storeId: string, id: string, data: any) {
    const supplier = await prisma.supplier.findFirst({ where: { id, storeId } });
    if (!supplier) throw new NotFoundError('Supplier');
    return prisma.supplier.update({ where: { id }, data });
  }

  async delete(storeId: string, id: string) {
    const supplier = await prisma.supplier.findFirst({
      where: { id, storeId },
      include: { _count: { select: { purchaseOrders: true } } },
    });
    if (!supplier) throw new NotFoundError('Supplier');
    if ((supplier as any)._count.purchaseOrders > 0) throw new Error('Cannot delete supplier with purchase orders');
    await prisma.supplier.delete({ where: { id } });
    return { message: 'Supplier deleted' };
  }
}

export const supplierService = new SupplierService();
