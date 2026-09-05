import prisma from '../config/database';

export class WishlistService {
  async getWishlist(storeId: string, customerId: string) {
    return prisma.wishlistItem.findMany({
      where: { customerId, product: { storeId, status: 'ACTIVE', deletedAt: null } },
      include: {
        product: {
          select: {
            id: true, name: true, slug: true, price: true, salePrice: true,
            images: { orderBy: { sortOrder: 'asc' }, take: 1 },
            reviews: { select: { rating: true } },
            stockQuantity: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addItem(storeId: string, customerId: string, productId: string) {
    const product = await prisma.product.findFirst({
      where: { id: productId, storeId, status: 'ACTIVE', deletedAt: null },
    });
    if (!product) throw new Error('Product not found');

    const existing = await prisma.wishlistItem.findUnique({
      where: { customerId_productId: { customerId, productId } },
    });
    if (existing) throw new Error('Product already in wishlist');

    return prisma.wishlistItem.create({
      data: { customerId, productId },
    });
  }

  async removeItem(customerId: string, productId: string) {
    const item = await prisma.wishlistItem.findUnique({
      where: { customerId_productId: { customerId, productId } },
    });
    if (!item) throw new Error('Item not in wishlist');
    await prisma.wishlistItem.delete({ where: { id: item.id } });
    return { message: 'Removed from wishlist' };
  }

  async isInWishlist(customerId: string, productId: string) {
    const item = await prisma.wishlistItem.findUnique({
      where: { customerId_productId: { customerId, productId } },
    });
    return { inWishlist: !!item };
  }

  async getCount(storeId: string, customerId: string) {
    const count = await prisma.wishlistItem.count({
      where: { customerId, product: { storeId } },
    });
    return { count };
  }
}

export const wishlistService = new WishlistService();
