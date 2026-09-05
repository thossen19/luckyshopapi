import prisma from '../config/database';
import { NotFoundError, BadRequestError } from '../utils/response';

export class CartService {
  async getCart(storeId: string, customerId?: string, sessionId?: string) {
    let cart;
    if (customerId) {
      cart = await prisma.cart.findUnique({
        where: { customerId_storeId: { customerId, storeId } },
      });
    } else if (sessionId) {
      cart = await prisma.cart.findUnique({
        where: { sessionId_storeId: { sessionId, storeId } },
      });
    }

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          storeId,
          customerId: customerId || null,
          sessionId: sessionId || null,
        },
      });
    }

    return prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true, name: true, slug: true, price: true, salePrice: true,
                stockQuantity: true, trackInventory: true,
                images: { take: 1, orderBy: { sortOrder: 'asc' } },
              },
            },
            variant: {
              select: {
                id: true, name: true, price: true, salePrice: true,
                stockQuantity: true, image: true,
              },
            },
          },
        },
      },
    });
  }

  async addItem(storeId: string, data: { productId: string; variantId?: string; quantity: number; customerId?: string; sessionId?: string }) {
    let cart = await this.getOrCreateCart(storeId, data.customerId, data.sessionId);
    const product = await prisma.product.findFirst({
      where: { id: data.productId, storeId, deletedAt: null, status: 'ACTIVE' },
      include: { variants: true },
    });
    if (!product) throw new NotFoundError('Product');

    let unitPrice = product.salePrice || product.price;
    let variant = null;
    if (data.variantId) {
      variant = product.variants.find((v) => v.id === data.variantId);
      if (!variant) throw new NotFoundError('Variant');
      unitPrice = variant.salePrice || variant.price;
    }

    // Check stock
    if (product.trackInventory) {
      const availableStock = variant ? variant.stockQuantity : product.stockQuantity;
      if (availableStock < data.quantity) {
        throw new BadRequestError('Insufficient stock');
      }
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: data.productId,
        variantId: data.variantId || null,
      },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + data.quantity;
      if (product.trackInventory) {
        const availableStock = variant ? variant.stockQuantity : product.stockQuantity;
        if (newQty > availableStock) throw new BadRequestError('Insufficient stock');
      }
      return prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQty,
          totalPrice: unitPrice.mul(newQty),
        },
      });
    }

    return prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: data.productId,
        variantId: data.variantId || null,
        quantity: data.quantity,
        unitPrice,
        totalPrice: unitPrice.mul(data.quantity),
      },
    });
  }

  async updateItem(storeId: string, itemId: string, quantity: number, customerId?: string) {
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true, product: true, variant: true },
    });
    if (!item) throw new NotFoundError('Cart item');

    if (item.product.trackInventory) {
      const stock = item.variant ? item.variant.stockQuantity : item.product.stockQuantity;
      if (quantity > stock) throw new BadRequestError('Insufficient stock');
    }

    return prisma.cartItem.update({
      where: { id: itemId },
      data: {
        quantity,
        totalPrice: item.unitPrice.mul(quantity),
      },
    });
  }

  async removeItem(storeId: string, itemId: string) {
    const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!item) throw new NotFoundError('Cart item');
    await prisma.cartItem.delete({ where: { id: itemId } });
    return { message: 'Item removed from cart' };
  }

  async clearCart(storeId: string, customerId?: string, sessionId?: string) {
    const cart = await this.getOrCreateCart(storeId, customerId, sessionId);
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return { message: 'Cart cleared' };
  }

  async applyCoupon(storeId: string, code: string, customerId?: string, sessionId?: string) {
    const coupon = await prisma.coupon.findFirst({
      where: { code, storeId, isActive: true },
    });
    if (!coupon) throw new NotFoundError('Coupon');
    if (coupon.endDate && coupon.endDate < new Date()) throw new BadRequestError('Coupon expired');
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw new BadRequestError('Coupon usage limit reached');

    const cart = await this.getOrCreateCart(storeId, customerId, sessionId);
    await prisma.cart.update({
      where: { id: cart.id },
      data: { couponCode: code },
    });

    return { message: 'Coupon applied', coupon: { discountType: coupon.discountType, discountValue: coupon.discountValue } };
  }

  private async getOrCreateCart(storeId: string, customerId?: string, sessionId?: string) {
    let cart;
    if (customerId) {
      cart = await prisma.cart.findUnique({
        where: { customerId_storeId: { customerId, storeId } },
      });
    } else if (sessionId) {
      cart = await prisma.cart.findUnique({
        where: { sessionId_storeId: { sessionId, storeId } },
      });
    }

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          storeId,
          customerId: customerId || null,
          sessionId: sessionId || null,
        },
      });
    }

    return cart;
  }
}

export const cartService = new CartService();
