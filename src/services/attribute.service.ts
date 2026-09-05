import prisma from '../config/database';
import { NotFoundError, ConflictError } from '../utils/response';

export class AttributeService {
  async findAll(storeId: string) {
    const where: any = {};
    if (storeId) where.storeId = storeId;
    return prisma.attribute.findMany({
      where,
      include: {
        values: { orderBy: { value: 'asc' } },
        _count: { select: { productAttributes: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(storeId: string, id: string) {
    const where: any = { id };
    if (storeId) where.storeId = storeId;
    const attribute = await prisma.attribute.findFirst({
      where,
      include: { values: { orderBy: { value: 'asc' } } },
    });
    if (!attribute) throw new NotFoundError('Attribute');
    return attribute;
  }

  async create(storeId: string, data: any) {
    const attrStoreId = storeId || null;
    const existing = await prisma.attribute.findFirst({
      where: { name: data.name, ...(attrStoreId ? { storeId: attrStoreId } : {}) },
    });
    if (existing) throw new ConflictError('Attribute with this name already exists');

    return prisma.attribute.create({
      data: {
        name: data.name,
        type: data.type || 'TEXT',
        storeId: attrStoreId ?? undefined,
        values: data.values
          ? {
              create: (data.values as any[]).map((v) => ({
                value: typeof v === 'string' ? v : v.value,
                colorCode: typeof v === 'string' ? null : v.colorCode || null,
              })),
            }
          : undefined,
      },
      include: { values: { orderBy: { value: 'asc' } } },
    });
  }

  async update(storeId: string, id: string, data: any) {
    const where: any = { id };
    if (storeId) where.storeId = storeId;
    const attribute = await prisma.attribute.findFirst({ where });
    if (!attribute) throw new NotFoundError('Attribute');

    return prisma.attribute.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        type: data.type !== undefined ? data.type : undefined,
      },
      include: { values: { orderBy: { value: 'asc' } } },
    });
  }

  async addValue(storeId: string, id: string, value: string, colorCode?: string | null) {
    const where: any = { id };
    if (storeId) where.storeId = storeId;
    const attribute = await prisma.attribute.findFirst({ where });
    if (!attribute) throw new NotFoundError('Attribute');

    return prisma.attributeValue.create({
      data: { value, colorCode: colorCode || null, attributeId: id },
    });
  }

  async removeValue(storeId: string, attributeId: string, valueId: string) {
    const where: any = { attributeId };
    if (storeId) {
      const attribute = await prisma.attribute.findFirst({ where: { id: attributeId, storeId } });
      if (!attribute) throw new NotFoundError('Attribute');
    }
    await prisma.attributeValue.delete({ where: { id: valueId } });
    return { message: 'Value removed' };
  }

  async delete(storeId: string, id: string) {
    const where: any = { id };
    if (storeId) where.storeId = storeId;
    const attribute = await prisma.attribute.findFirst({ where });
    if (!attribute) throw new NotFoundError('Attribute');

    await prisma.attribute.delete({ where: { id } });
    return { message: 'Attribute deleted' };
  }
}

export const attributeService = new AttributeService();
