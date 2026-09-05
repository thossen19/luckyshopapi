import prisma from '../config/database';
import { NotFoundError } from '../utils/response';
import { generateSlug } from '../utils/helpers';

export class StoreService {
  async findById(id: string) {
    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        settings: true,
        subscription: { include: { plan: true } },
      },
    });
    if (!store) throw new NotFoundError('Store');
    return store;
  }

  async findBySlug(slug: string) {
    const store = await prisma.store.findUnique({
      where: { slug },
      include: {
        settings: true,
        subscription: { include: { plan: true } },
      },
    });
    if (!store) throw new NotFoundError('Store');
    return store;
  }

  async findByDomain(domain: string) {
    return prisma.store.findUnique({
      where: { domain },
      include: { settings: true },
    });
  }

  async create(data: any, userId: string) {
    const slug = generateSlug(data.name);
    const existing = await prisma.store.findUnique({ where: { slug } });
    if (existing) throw new Error('Store with this name already exists');

    const store = await prisma.store.create({
      data: {
        ...data,
        slug,
        settings: {
          create: {},
        },
      },
      include: { settings: true },
    });

    // Assign user as store owner
    await prisma.user.update({
      where: { id: userId },
      data: { storeId: store.id, role: 'STORE_OWNER' },
    });

    return store;
  }

  async update(id: string, data: any) {
    const store = await prisma.store.findUnique({ where: { id } });
    if (!store) throw new NotFoundError('Store');

    return prisma.store.update({
      where: { id },
      data,
    });
  }

  async updateSettings(storeId: string, data: any) {
    return prisma.storeSetting.upsert({
      where: { storeId },
      create: { ...data, storeId },
      update: data,
    });
  }

  async getStorefrontData(slug: string) {
    const store = await prisma.store.findUnique({
      where: { slug, isActive: true },
      include: {
        settings: true,
        categories: {
          where: { isActive: true, parentId: null },
          include: {
            children: {
              where: { isActive: true },
              include: { _count: { select: { products: true } } },
            },
            _count: { select: { products: true } },
          },
          orderBy: { sortOrder: 'asc' },
        },
        brands: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!store) throw new NotFoundError('Store');

    const [featuredProducts, newArrivals, bestSellers] = await Promise.all([
      prisma.product.findMany({
        where: { storeId: store.id, isFeatured: true, status: 'ACTIVE', deletedAt: null },
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 3 },
          reviews: { select: { rating: true } },
          category: { select: { name: true, slug: true } },
        },
        take: 12,
      }),
      prisma.product.findMany({
        where: { storeId: store.id, status: 'ACTIVE', deletedAt: null },
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 3 },
          reviews: { select: { rating: true } },
        },
        take: 12,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.findMany({
        where: { storeId: store.id, status: 'ACTIVE', deletedAt: null },
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 3 },
          reviews: { select: { rating: true } },
          orderItems: { select: { quantity: true } },
        },
        take: 12,
      }),
    ]);

    const enrichedBestSellers = bestSellers
      .map((p) => ({
        ...p,
        totalSold: p.orderItems.reduce((sum, i) => sum + i.quantity, 0),
      }))
      .sort((a: any, b: any) => b.totalSold - a.totalSold);

    return {
      store,
      featuredProducts,
      newArrivals,
      bestSellers: enrichedBestSellers,
    };
  }

  async getBrandingData(slug: string) {
    const store = await prisma.store.findUnique({
      where: { slug, isActive: true },
      select: {
        id: true,
        name: true,
        logo: true,
        favicon: true,
        currency: true,
        font: true,
        fontColor: true,
      },
    });
    if (!store) throw new NotFoundError('Store');
    return store;
  }

  async getAllStores() {
    return prisma.store.findMany({
      include: {
        subscription: { include: { plan: true } },
        _count: { select: { products: true, orders: true, customers: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const storeService = new StoreService();
