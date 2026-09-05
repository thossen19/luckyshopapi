import prisma from '../config/database';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/response';
import { PaginatedResponse, ProductFilter } from '../types';
import { parsePagination, generateSlug, generateSKU } from '../utils/helpers';

export class ProductService {
  async findAll(storeId: string | undefined, filters: ProductFilter) {
    const { page, limit, skip } = parsePagination(filters.page, filters.limit);
    const where: any = { ...(storeId ? { storeId } : {}), deletedAt: null };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { sku: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.categorySlug) {
      where.category = { slug: filters.categorySlug };
    }
    if (filters.brandId) where.brandId = filters.brandId;
    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = parseFloat(filters.minPrice);
      if (filters.maxPrice) where.price.lte = parseFloat(filters.maxPrice);
    }
    if (filters.inStock === 'true') where.stockQuantity = { gt: 0 };

    const orderBy: any = {};
    if (filters.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { sortOrder: 'asc' }, take: 5 },
          variants: { where: { isActive: true } },
          reviews: { select: { rating: true } },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    const enrichedProducts = products.map((p) => ({
      ...p,
      averageRating: p.reviews.length
        ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
        : 0,
      reviewCount: p.reviews.length,
    }));

    return { data: enrichedProducts, total, page, limit };
  }

  async getOptions(storeId?: string) {
    const products = await prisma.product.findMany({
      where: {
        ...(storeId ? { storeId } : {}),
        deletedAt: null,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        category: true,
        brand: true,
        images: { take: 1, orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { name: 'asc' },
    });
    return products.map((p) => ({
      ...p,
      image: p.images[0]?.url ?? null,
      images: undefined,
    }));
  }

  async findById(storeId: string | undefined, id: string) {
    const product = await prisma.product.findFirst({
      where: { id, ...(storeId ? { storeId } : {}), deletedAt: null },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true, logo: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        attributes: {
          include: { attribute: true },
        },
        reviews: {
          where: { status: 'APPROVED' },
          include: { customer: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) throw new NotFoundError('Product');

    const averageRating = product.reviews.length
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

    return { ...product, averageRating, reviewCount: product.reviews.length };
  }

  async findBySlug(storeId: string | undefined, slug: string) {
    const product = await prisma.product.findFirst({
      where: { slug, ...(storeId ? { storeId } : {}), deletedAt: null },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { where: { isActive: true } },
        attributes: { include: { attribute: true } },
        reviews: {
          where: { status: 'APPROVED' },
          include: { customer: { select: { firstName: true, lastName: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
        orderItems: { select: { quantity: true } },
      },
    });

    if (!product) throw new NotFoundError('Product');

    const soldQuantity = product.orderItems.reduce((sum, item) => sum + item.quantity, 0);

    return { ...product, soldQuantity };
  }

  async create(storeId: string | undefined, data: any) {
    const slug = generateSlug(data.name);

    // If no storeId provided, get the first active store
    let effectiveStoreId = storeId;
    if (!effectiveStoreId) {
      const firstStore = await prisma.store.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      });
      if (!firstStore) throw new BadRequestError('No active store found');
      effectiveStoreId = firstStore.id;
    }

    // Check slug uniqueness within store
    const existing = await prisma.product.findFirst({
      where: { slug, storeId: effectiveStoreId, deletedAt: null },
    });
    if (existing) throw new ConflictError('Product with this name already exists');

    // Auto-generate SKU if not provided
    const sku = data.sku || generateSKU(data.name);

    const product = await prisma.product.create({
      data: {
        ...data,
        slug,
        sku,
        storeId: effectiveStoreId,
        tags: data.tags || null,
      },
      include: {
        category: true,
        brand: true,
        images: true,
        variants: true,
      },
    });

    return product;
  }

  async update(storeId: string | undefined, id: string, data: any) {
    const product = await prisma.product.findFirst({
      where: { id, ...(storeId ? { storeId } : {}), deletedAt: null },
    });
    if (!product) throw new NotFoundError('Product');

    if (data.name && data.name !== product.name) {
      data.slug = generateSlug(data.name);
    }

    return prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        brand: true,
        images: true,
        variants: true,
      },
    });
  }

  async softDelete(storeId: string | undefined, id: string) {
    const product = await prisma.product.findFirst({
      where: { id, ...(storeId ? { storeId } : {}), deletedAt: null },
    });
    if (!product) throw new NotFoundError('Product');

    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'ARCHIVED' },
    });

    return { message: 'Product deleted' };
  }

  async addImage(storeId: string | undefined, productId: string, url: string, alt?: string) {
    const product = await prisma.product.findFirst({
      where: { id: productId, ...(storeId ? { storeId } : {}), deletedAt: null },
    });
    if (!product) throw new NotFoundError('Product');

    const maxSort = await prisma.productImage.findFirst({
      where: { productId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    return prisma.productImage.create({
      data: {
        url,
        alt: alt || product.name,
        productId,
        sortOrder: (maxSort?.sortOrder || 0) + 1,
      },
    });
  }

  async deleteImage(storeId: string | undefined, imageId: string) {
    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
      include: { product: true },
    });
    if (!image || (storeId && image.product.storeId !== storeId)) throw new NotFoundError('Image');
    await prisma.productImage.delete({ where: { id: imageId } });
    return { message: 'Image deleted' };
  }

  async getFeatured(storeId: string, limit = 10) {
    return prisma.product.findMany({
      where: { storeId, isFeatured: true, status: 'ACTIVE', deletedAt: null },
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 3 },
        reviews: { select: { rating: true } },
        category: { select: { name: true, slug: true } },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getNewArrivals(storeId: string, limit = 10) {
    return prisma.product.findMany({
      where: { storeId, status: 'ACTIVE', deletedAt: null },
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 3 },
        reviews: { select: { rating: true } },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBestSellers(storeId: string, limit = 10) {
    const products = await prisma.product.findMany({
      where: { storeId, status: 'ACTIVE', deletedAt: null },
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 3 },
        orderItems: { select: { quantity: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return products
      .map((p) => ({
        ...p,
        totalSold: p.orderItems.reduce((sum, item) => sum + item.quantity, 0),
      }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, limit);
  }

  async search(storeId: string, query: string, limit = 20) {
    return prisma.product.findMany({
      where: {
        storeId,
        status: 'ACTIVE',
        deletedAt: null,
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { tags: { contains: query } },
          { sku: { contains: query } },
        ],
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        reviews: { select: { rating: true } },
        category: { select: { name: true, slug: true } },
      },
      take: limit,
    });
  }
}

export const productService = new ProductService();
