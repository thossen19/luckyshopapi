import prisma from '../config/database';
import { NotFoundError } from '../utils/response';

export class MenuService {
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
    return prisma.menu.findMany({
      where: { storeId: id },
      include: {
        items: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: { category: { select: { id: true, name: true, slug: true } } },
        },
      },
      orderBy: [{ location: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  async findByLocation(location: string, storeId?: string | null) {
    const id = await this.resolveStoreId(storeId);
    if (!id) return null;
    return prisma.menu.findFirst({
      where: { storeId: id, location: location as any, isActive: true },
      include: {
        items: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: { category: { select: { id: true, name: true, slug: true } } },
        },
      },
    });
  }

  async findById(storeId: string | undefined | null, id: string) {
    const sid = (await this.resolveStoreId(storeId)) as string;
    const menu = await prisma.menu.findFirst({
      where: { id, storeId: sid },
      include: {
        items: {
          orderBy: { sortOrder: 'asc' },
          include: { category: { select: { id: true, name: true, slug: true } } },
        },
      },
    });
    if (!menu) throw new NotFoundError('Menu');
    return menu;
  }

  async create(storeId: string | undefined | null, data: any) {
    const id = (await this.resolveStoreId(storeId)) as string;
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const max = await prisma.menu.aggregate({
      where: { storeId: id },
      _max: { sortOrder: true },
    });
    return prisma.menu.create({
      data: {
        storeId: id,
        name: data.name,
        slug,
        description: data.description || null,
        location: data.location || 'HEADER',
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? ((max._max.sortOrder ?? 0) + 1),
      },
      include: { items: true },
    });
  }

  async update(storeId: string | undefined | null, id: string, data: any) {
    const sid = (await this.resolveStoreId(storeId)) as string;
    const menu = await prisma.menu.findFirst({ where: { id, storeId: sid } });
    if (!menu) throw new NotFoundError('Menu');
    return prisma.menu.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        location: data.location,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
      include: { items: true },
    });
  }

  async delete(storeId: string | undefined | null, id: string) {
    const sid = (await this.resolveStoreId(storeId)) as string;
    const menu = await prisma.menu.findFirst({ where: { id, storeId: sid } });
    if (!menu) throw new NotFoundError('Menu');
    await prisma.menu.delete({ where: { id } });
    return { message: 'Menu deleted' };
  }

  async createItem(storeId: string | undefined | null, menuId: string, data: any) {
    const sid = (await this.resolveStoreId(storeId)) as string;
    const menu = await prisma.menu.findFirst({ where: { id: menuId, storeId: sid } });
    if (!menu) throw new NotFoundError('Menu');
    const max = await prisma.menuItem.aggregate({
      where: { menuId },
      _max: { sortOrder: true },
    });
    return prisma.menuItem.create({
      data: {
        menuId,
        label: data.label,
        url: data.url || null,
        categoryId: data.categoryId || null,
        pageType: data.pageType || 'CATEGORY',
        sortOrder: data.sortOrder ?? ((max._max.sortOrder ?? 0) + 1),
        isActive: data.isActive ?? true,
        fontColor: data.fontColor || null,
        hoverBgColor: data.hoverBgColor || null,
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
  }

  async updateItem(storeId: string | undefined | null, itemId: string, data: any) {
    const sid = (await this.resolveStoreId(storeId)) as string;
    const item = await prisma.menuItem.findFirst({
      where: { id: itemId },
      include: { menu: true },
    });
    if (!item || item.menu.storeId !== sid) throw new NotFoundError('Menu item');
    return prisma.menuItem.update({
      where: { id: itemId },
      data: {
        label: data.label,
        url: data.url,
        categoryId: data.categoryId,
        pageType: data.pageType,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
        fontColor: data.fontColor,
        hoverBgColor: data.hoverBgColor,
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
  }

  async deleteItem(storeId: string | undefined | null, itemId: string) {
    const sid = (await this.resolveStoreId(storeId)) as string;
    const item = await prisma.menuItem.findFirst({
      where: { id: itemId },
      include: { menu: true },
    });
    if (!item || item.menu.storeId !== sid) throw new NotFoundError('Menu item');
    await prisma.menuItem.delete({ where: { id: itemId } });
    return { message: 'Menu item deleted' };
  }

  async getPromotionBar(storeId?: string | null) {
    const id = await this.resolveStoreId(storeId);
    if (!id) return null;
    const setting = await prisma.storeSetting.findUnique({
      where: { storeId: id },
      select: {
        promotionBarEnabled: true,
        promotionBarText: true,
        promotionBarColor: true,
        promotionBarTextColor: true,
        promotionBarLinks: true,
      },
    });
    return setting;
  }

  async updatePromotionBar(storeId: string | undefined | null, data: any) {
    const id = (await this.resolveStoreId(storeId)) as string;
    const setting = await prisma.storeSetting.findUnique({ where: { storeId: id } });
    if (!setting) throw new NotFoundError('Store settings');
    return prisma.storeSetting.update({
      where: { storeId: id },
      data: {
        promotionBarEnabled: data.promotionBarEnabled,
        promotionBarText: data.promotionBarText,
        promotionBarColor: data.promotionBarColor,
        promotionBarTextColor: data.promotionBarTextColor,
        promotionBarLinks: data.promotionBarLinks ?? undefined,
      },
      select: {
        promotionBarEnabled: true,
        promotionBarText: true,
        promotionBarColor: true,
        promotionBarTextColor: true,
        promotionBarLinks: true,
      },
    });
  }
}

export const menuService = new MenuService();
