import prisma from '../config/database';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/response';
import { parsePagination, generateSlug } from '../utils/helpers';

export class CategoryService {
  async resolveStoreId(storeId?: string | null) {
    if (storeId) return storeId;
    const first = await prisma.store.findFirst({
      where: { isActive: true },
      select: { id: true },
    });
    return first?.id ?? null;
  }

  async findAll(storeId?: string | null, includeChildren = false) {
    const id = (await this.resolveStoreId(storeId)) as string;
    if (!id) return [];
    return prisma.category.findMany({
      where: { storeId: id, parentId: null },
      include: {
        children: includeChildren ? {
          include: {
            children: true,
            _count: { select: { products: true } },
          },
          orderBy: { sortOrder: 'asc' },
        } : false,
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findAllFlat(storeId?: string | null) {
    const id = (await this.resolveStoreId(storeId)) as string;
    if (!id) return [];
    return prisma.category.findMany({
      where: { storeId: id },
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(storeId: string | undefined | null, id: string) {
    const sid = (await this.resolveStoreId(storeId)) as string;
    const category = await prisma.category.findFirst({
      where: { id, storeId: sid },
      include: {
        parent: true,
        children: {
          include: { _count: { select: { products: true } } },
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { products: true } },
      },
    });
    if (!category) throw new NotFoundError('Category');
    return category;
  }

  async findBySlug(storeId: string | undefined | null, slug: string) {
    const sid = (await this.resolveStoreId(storeId)) as string;
    const category = await prisma.category.findFirst({
      where: { slug, storeId: sid },
      include: {
        children: {
          include: { _count: { select: { products: true } } },
          where: { isActive: true },
        },
        _count: { select: { products: true } },
      },
    });
    if (!category) throw new NotFoundError('Category');
    return category;
  }

  async create(storeId: string | undefined | null, data: any) {
    const id = (await this.resolveStoreId(storeId)) as string;
    const slug = generateSlug(data.name);
    const existing = await prisma.category.findFirst({
      where: { slug, storeId: id },
    });
    if (existing) throw new ConflictError('Category with this name already exists');

    if (data.parentId) {
      const parent = await prisma.category.findFirst({
        where: { id: data.parentId, storeId: id },
      });
      if (!parent) throw new NotFoundError('Parent category');
    }

    return prisma.category.create({
      data: {
        ...data,
        slug,
        storeId: id,
      },
    });
  }

  async update(storeId: string | undefined | null, id: string, data: any) {
    const sid = (await this.resolveStoreId(storeId)) as string;
    const category = await prisma.category.findFirst({
      where: { id, storeId: sid },
    });
    if (!category) {
      // For SUPER_ADMIN, try finding without storeId restriction
      const anyCategory = await prisma.category.findUnique({ where: { id } });
      if (!anyCategory) throw new NotFoundError('Category');
      
      if (data.name) data.slug = generateSlug(data.name);
      if (data.parentId === id) throw new BadRequestError('Category cannot be its own parent');

      return prisma.category.update({
        where: { id },
        data,
      });
    }

    if (data.name) data.slug = generateSlug(data.name);
    if (data.parentId === id) throw new BadRequestError('Category cannot be its own parent');

    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(storeId: string | undefined | null, id: string) {
    const sid = (await this.resolveStoreId(storeId)) as string;
    const category = await prisma.category.findFirst({
      where: { id, storeId: sid },
      include: { children: true, products: true },
    });
    if (!category) throw new NotFoundError('Category');
    if (category.children.length > 0) throw new BadRequestError('Cannot delete category with children');
    if (category.products.length > 0) throw new BadRequestError('Cannot delete category with products');

    await prisma.category.delete({ where: { id } });
    return { message: 'Category deleted' };
  }

  async reorder(storeId: string | undefined | null, ids: string[]) {
    const sid = (await this.resolveStoreId(storeId)) as string;
    if (!sid) return { message: 'Categories reordered' };
    for (let i = 0; i < ids.length; i++) {
      await prisma.category.updateMany({
        where: { id: ids[i], storeId: sid },
        data: { sortOrder: i },
      });
    }
    return { message: 'Categories reordered' };
  }
}

export const categoryService = new CategoryService();
