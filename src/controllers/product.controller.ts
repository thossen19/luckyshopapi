import { Response } from 'express';
import { productService } from '../services/product.service';
import { AuthRequest } from '../types';
import { sendSuccess, sendPaginated } from '../utils/response';
import prisma from '../config/database';

async function resolveStoreId(req: AuthRequest, productId?: string): Promise<string | undefined> {
  // Try to get storeId from various sources
  const storeId = (req as any).storeId || req.user?.storeId || (req.query.storeId as string);
  if (storeId) return storeId;

  // For SUPER_ADMIN without storeId, look up the product to get its storeId
  if (productId) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { storeId: true },
    });
    return product?.storeId;
  }

  return undefined;
}

export class ProductController {
  async findAll(req: AuthRequest, res: Response) {
    const storeId = await resolveStoreId(req);
    const result = await productService.findAll(storeId, req.query as any);
    sendPaginated(res, result.data, result.total, result.page, result.limit);
  }

  async findById(req: AuthRequest, res: Response) {
    const storeId = await resolveStoreId(req, req.params.id);
    const product = await productService.findById(storeId, req.params.id);
    sendSuccess(res, product);
  }

  async findBySlug(req: AuthRequest, res: Response) {
    const storeId = await resolveStoreId(req);
    const product = await productService.findBySlug(storeId, req.params.slug);
    sendSuccess(res, product);
  }

  async create(req: AuthRequest, res: Response) {
    const storeId = await resolveStoreId(req);
    const product = await productService.create(storeId!, req.body);
    sendSuccess(res, product, 'Product created', 201);
  }

  async update(req: AuthRequest, res: Response) {
    const storeId = await resolveStoreId(req, req.params.id);
    const product = await productService.update(storeId!, req.params.id, req.body);
    sendSuccess(res, product, 'Product updated');
  }

  async delete(req: AuthRequest, res: Response) {
    const storeId = await resolveStoreId(req, req.params.id);
    await productService.softDelete(storeId!, req.params.id);
    sendSuccess(res, null, 'Product deleted');
  }

  async addImage(req: AuthRequest, res: Response) {
    const storeId = await resolveStoreId(req, req.params.id);
    const image = await productService.addImage(storeId!, req.params.id, req.body.url, req.body.alt);
    sendSuccess(res, image, 'Image added', 201);
  }

  async deleteImage(req: AuthRequest, res: Response) {
    const storeId = await resolveStoreId(req, req.params.imageId);
    await productService.deleteImage(storeId!, req.params.imageId);
    sendSuccess(res, null, 'Image deleted');
  }

  async getFeatured(req: AuthRequest, res: Response) {
    const storeId = req.query.storeId as string || req.user?.storeId;
    const products = await productService.getFeatured(storeId!, parseInt(req.query.limit as string) || 10);
    sendSuccess(res, products);
  }

  async getNewArrivals(req: AuthRequest, res: Response) {
    const storeId = req.query.storeId as string;
    const products = await productService.getNewArrivals(storeId, parseInt(req.query.limit as string) || 10);
    sendSuccess(res, products);
  }

  async getBestSellers(req: AuthRequest, res: Response) {
    const storeId = req.query.storeId as string;
    const products = await productService.getBestSellers(storeId, parseInt(req.query.limit as string) || 10);
    sendSuccess(res, products);
  }

  async search(req: AuthRequest, res: Response) {
    const storeId = req.query.storeId as string;
    const query = req.query.q as string;
    const results = await productService.search(storeId, query);
    sendSuccess(res, results);
  }

  async getOptions(req: AuthRequest, res: Response) {
    const storeId = (req.query.storeId as string) || (req as any).storeId || req.user?.storeId;
    const options = await productService.getOptions(storeId as string | undefined);
    sendSuccess(res, options);
  }
}

export const productController = new ProductController();
