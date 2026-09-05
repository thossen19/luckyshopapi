import prisma from '../config/database';
import { NotFoundError } from '../utils/response';
import { parsePagination } from '../utils/helpers';

export class BrandService {
  async findAll(storeId: string) {
    return prisma.brand.findMany({
      where: { storeId },
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findById(storeId: string, id: string) {
    const brand = await prisma.brand.findFirst({
      where: { id, storeId },
      include: { _count: { select: { products: true } } },
    });
    if (!brand) throw new NotFoundError('Brand');
    return brand;
  }

  async findBySlug(storeId: string, slug: string) {
    const brand = await prisma.brand.findFirst({
      where: { slug, storeId },
      include: { _count: { select: { products: true } } },
    });
    if (!brand) throw new NotFoundError('Brand');
    return brand;
  }

  async create(storeId: string, data: any) {
    const slug = generateSlug(data.name);
    return prisma.brand.create({ data: { ...data, slug, storeId } });
  }

  async update(storeId: string, id: string, data: any) {
    const brand = await prisma.brand.findFirst({ where: { id, storeId } });
    if (!brand) throw new NotFoundError('Brand');
    if (data.name) data.slug = generateSlug(data.name);
    return prisma.brand.update({ where: { id }, data });
  }

  async delete(storeId: string, id: string) {
    const brand = await prisma.brand.findFirst({
      where: { id, storeId },
      include: { _count: { select: { products: true } } },
    });
    if (!brand) throw new NotFoundError('Brand');
    if ((brand as any)._count.products > 0) throw new Error('Cannot delete brand with products');
    await prisma.brand.delete({ where: { id } });
    return { message: 'Brand deleted' };
  }
}

function generateSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const brandService = new BrandService();
