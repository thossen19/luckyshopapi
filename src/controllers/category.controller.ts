import { Response } from 'express';
import { categoryService } from '../services/category.service';
import { brandService } from '../services/brand.service';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';
import prisma from '../config/database';

export class CategoryController {
  async findAll(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user?.storeId || req.query.storeId as string;
    const categories = await categoryService.findAll(storeId, true);
    sendSuccess(res, categories);
  }

  async findById(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user?.storeId || req.query.storeId as string;
    const category = await categoryService.findById(storeId, req.params.id);
    sendSuccess(res, category);
  }

  async findBySlug(req: AuthRequest, res: Response) {
    const storeId = req.query.storeId as string || (req as any).storeId || req.user?.storeId;
    const category = await categoryService.findBySlug(storeId, req.params.slug);
    sendSuccess(res, category);
  }

  async create(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user?.storeId || req.body.storeId;
    const category = await categoryService.create(storeId, req.body);
    sendSuccess(res, category, 'Category created', 201);
  }

  async update(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user?.storeId || req.body.storeId;
    const category = await categoryService.update(storeId, req.params.id, req.body);
    sendSuccess(res, category, 'Category updated');
  }

  async delete(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user?.storeId || req.body.storeId;
    await categoryService.delete(storeId, req.params.id);
    sendSuccess(res, null, 'Category deleted');
  }

  async reorder(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user?.storeId || req.body.storeId;
    await categoryService.reorder(storeId, req.body.ids);
    sendSuccess(res, null, 'Categories reordered');
  }
}

export class BrandController {
  async findAll(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user?.storeId || req.query.storeId as string;
    const brands = await brandService.findAll(storeId);
    sendSuccess(res, brands);
  }

  async findById(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user?.storeId || req.query.storeId as string;
    const brand = await brandService.findById(storeId, req.params.id);
    sendSuccess(res, brand);
  }

  async create(req: AuthRequest, res: Response) {
    let storeId = (req as any).storeId || req.user?.storeId || req.body.storeId;
    // For SUPER_ADMIN without storeId, get first active store
    if (!storeId) {
      const firstStore = await prisma.store.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      });
      if (firstStore) storeId = firstStore.id;
    }
    const brand = await brandService.create(storeId, req.body);
    sendSuccess(res, brand, 'Brand created', 201);
  }

  async update(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user?.storeId || req.body.storeId;
    const brand = await brandService.update(storeId, req.params.id, req.body);
    sendSuccess(res, brand, 'Brand updated');
  }

  async delete(req: AuthRequest, res: Response) {
    const storeId = (req as any).storeId || req.user?.storeId || req.body.storeId;
    await brandService.delete(storeId, req.params.id);
    sendSuccess(res, null, 'Brand deleted');
  }
}

export const categoryController = new CategoryController();
export const brandController = new BrandController();
