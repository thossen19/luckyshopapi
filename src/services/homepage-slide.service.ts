import prisma from '../config/database';
import { NotFoundError } from '../utils/response';

export class HomepageSlideService {
  async resolveStoreId(storeId?: string | null) {
    if (storeId) return storeId;
    const first = await prisma.store.findFirst({
      where: { isActive: true },
      select: { id: true },
    });
    return first?.id ?? null;
  }

  async findAll(storeId?: string | null) {
    const id = await this.resolveStoreId(storeId);
    if (!id) return [];
    return prisma.homepageSlide.findMany({
      where: { storeId: id },
      include: {
        product: {
          select: {
            id: true,
            slug: true,
            name: true,
            price: true,
            salePrice: true,
            category: { select: { id: true, name: true, image: true } },
          },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async findActive(storeId?: string | null) {
    const id = await this.resolveStoreId(storeId);
    if (!id) return [];
    return prisma.homepageSlide.findMany({
      where: { storeId: id, isActive: true },
      include: {
        product: {
          select: {
            id: true,
            slug: true,
            name: true,
            price: true,
            salePrice: true,
            category: { select: { id: true, name: true, image: true } },
          },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async findById(storeId: string | undefined | null, id: string) {
    const sid = (await this.resolveStoreId(storeId)) as string;
    const slide = await prisma.homepageSlide.findFirst({
      where: { id, storeId: sid },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            salePrice: true,
            category: { select: { id: true, name: true, image: true } },
          },
        },
      },
    });
    if (!slide) throw new NotFoundError('Homepage slide');
    return slide;
  }

  async create(storeId: string | undefined | null, data: any) {
    const id = (await this.resolveStoreId(storeId)) as string;
    const max = await prisma.homepageSlide.aggregate({
      where: { storeId: id },
      _max: { sortOrder: true },
    });
    return prisma.homepageSlide.create({
      data: {
        storeId: id,
        sortOrder: data.sortOrder ?? ((max._max.sortOrder ?? 0) + 1),
        imageUrl: data.imageUrl ?? null,
        bgColor: data.bgColor ?? '#6366f1',
        title: data.title ?? '',
        subtitle: data.subtitle ?? null,
        buttonText: data.buttonText ?? 'Shop Now',
        productId: data.productId ?? null,
        isActive: data.isActive ?? true,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            salePrice: true,
            category: { select: { id: true, name: true, image: true } },
          },
        },
      },
    });
  }

  async update(storeId: string | undefined | null, id: string, data: any) {
    const sid = (await this.resolveStoreId(storeId)) as string;
    const slide = await prisma.homepageSlide.findFirst({ where: { id, storeId: sid } });
    if (!slide) throw new NotFoundError('Homepage slide');

    return prisma.homepageSlide.update({
      where: { id },
      data: {
        sortOrder: data.sortOrder,
        imageUrl: data.imageUrl,
        bgColor: data.bgColor,
        title: data.title,
        subtitle: data.subtitle,
        buttonText: data.buttonText,
        productId: data.productId,
        isActive: data.isActive,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            salePrice: true,
            category: { select: { id: true, name: true, image: true } },
          },
        },
      },
    });
  }

  async reorder(storeId: string | undefined | null, ids: string[]) {
    const sid = (await this.resolveStoreId(storeId)) as string;
    for (let i = 0; i < ids.length; i++) {
      await prisma.homepageSlide.updateMany({
        where: { id: ids[i], storeId: sid },
        data: { sortOrder: i },
      });
    }
    return { message: 'Slides reordered' };
  }

  async delete(storeId: string | undefined | null, id: string) {
    const sid = (await this.resolveStoreId(storeId)) as string;
    const slide = await prisma.homepageSlide.findFirst({ where: { id, storeId: sid } });
    if (!slide) throw new NotFoundError('Homepage slide');
    await prisma.homepageSlide.delete({ where: { id } });
    return { message: 'Slide deleted' };
  }
}

export const homepageSlideService = new HomepageSlideService();
