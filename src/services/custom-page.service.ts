import prisma from '../config/database';
import { NotFoundError } from '../utils/response';

export class CustomPageService {
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
    return prisma.customPage.findMany({
      where: { storeId: id },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findBySlug(storeId: string | undefined | null, slug: string) {
    const id = (await this.resolveStoreId(storeId)) as string;
    return prisma.customPage.findFirst({
      where: { storeId: id, slug },
    });
  }

  async findPublishedBySlug(storeId: string | undefined | null, slug: string) {
    const id = (await this.resolveStoreId(storeId)) as string;
    return prisma.customPage.findFirst({
      where: { storeId: id, slug, status: 'published' },
    });
  }

  async findById(storeId: string | undefined | null, id: string) {
    const sid = (await this.resolveStoreId(storeId)) as string;
    const page = await prisma.customPage.findFirst({ where: { id, storeId: sid } });
    if (!page) throw new NotFoundError('Page');
    return page;
  }

  async create(storeId: string | undefined | null, data: any) {
    const id = (await this.resolveStoreId(storeId)) as string;
    const existing = await prisma.customPage.findUnique({
      where: { storeId_slug: { storeId: id, slug: data.slug } },
    });
    if (existing) {
      throw new Error('A page with this slug already exists');
    }
    return prisma.customPage.create({
      data: {
        storeId: id,
        title: data.title ?? 'Untitled Page',
        slug: data.slug,
        status: data.status ?? 'draft',
        template: data.template ?? 'blank',
        description: data.description,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
        background: data.background ?? '#ffffff',
        maxWidth: data.maxWidth ?? 960,
        blocks: data.blocks ?? [],
      },
    });
  }

  async update(storeId: string | undefined | null, id: string, data: any) {
    const sid = (await this.resolveStoreId(storeId)) as string;
    const page = await prisma.customPage.findFirst({ where: { id, storeId: sid } });
    if (!page) throw new NotFoundError('Page');

    if (data.slug && data.slug !== page.slug) {
      const existing = await prisma.customPage.findUnique({
        where: { storeId_slug: { storeId: sid, slug: data.slug } },
      });
      if (existing) throw new Error('A page with this slug already exists');
    }

    return prisma.customPage.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        status: data.status,
        template: data.template,
        description: data.description,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
        background: data.background,
        maxWidth: data.maxWidth,
        blocks: data.blocks,
      },
    });
  }

  async delete(storeId: string | undefined | null, id: string) {
    const sid = (await this.resolveStoreId(storeId)) as string;
    const page = await prisma.customPage.findFirst({ where: { id, storeId: sid } });
    if (!page) throw new NotFoundError('Page');
    await prisma.customPage.delete({ where: { id } });
    return { message: 'Page deleted' };
  }
}

export const customPageService = new CustomPageService();
