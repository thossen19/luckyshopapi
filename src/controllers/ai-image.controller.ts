import { Request, Response } from 'express';
import { imageHuntService } from '../services/image-hunt/image-hunt.service';
import { productService } from '../services/product.service';
import { sendSuccess, BadRequestError } from '../utils/response';
import { AuthRequest } from '../types';
import axios from 'axios';
import * as crypto from 'crypto';
import prisma from '../config/database';

export class AiImageController {
  async hunt(req: AuthRequest, res: Response) {
    const { type, query, country } = req.body;

    if (!type || !['product', 'category', 'brand'].includes(type)) {
      throw new BadRequestError('Invalid type. Must be product, category, or brand.');
    }

    if (!query || typeof query !== 'string') {
      throw new BadRequestError('Query is required.');
    }

    const countryCode = country || 'US';
    const items = await imageHuntService.hunt(query, countryCode, 12);

    const images = items.map(item => item.url);
    const sources: Record<string, string> = {};
    for (const item of items) {
      sources[item.url] = item.source;
    }

    sendSuccess(res, { images, sources, country: countryCode });
  }

  async set(req: AuthRequest, res: Response) {
    const { type, id, image_url, query, country } = req.body;

    if (!type || !['product', 'category', 'brand'].includes(type)) {
      throw new BadRequestError('Invalid type. Must be product, category, or brand.');
    }

    if (!id) {
      throw new BadRequestError('ID is required.');
    }

    if (!image_url) {
      throw new BadRequestError('Image URL is required.');
    }

    const urls = [image_url];

    // If query provided, hunt for more images as fallback
    if (query) {
      const countryCode = country || 'US';
      const items = await imageHuntService.hunt(query, countryCode, 8);
      const extraUrls = items.map(item => item.url);
      urls.push(...extraUrls);
    }

    let result: string | null = null;

    switch (type) {
      case 'product':
        result = await this.setProductImage(id, urls);
        break;
      case 'category':
        result = await this.setCategoryImage(id, urls);
        break;
      case 'brand':
        result = await this.setBrandImage(id, urls);
        break;
    }

    if (!result) {
      throw new BadRequestError('Could not download the image. Please try hunting again.');
    }

    sendSuccess(res, { image: result }, 'Image set successfully.');
  }

  private async setProductImage(productId: string, urls: string[]): Promise<string | null> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) return null;

    const filename = `${crypto.createHash('md5').update(product.name).digest('hex').slice(0, 8)}.jpg`;
    const path = await this.downloadFirstWorking(urls, 'products', filename);

    if (!path) return null;

    // Add image to product
    await prisma.productImage.create({
      data: {
        url: `/uploads/${path}`,
        alt: product.name,
        productId: productId,
        sortOrder: 999,
      },
    });

    return `/uploads/${path}`;
  }

  private async setCategoryImage(categoryId: string, urls: string[]): Promise<string | null> {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) return null;

    const filename = `${crypto.createHash('md5').update(category.name).digest('hex').slice(0, 8)}.jpg`;
    const path = await this.downloadFirstWorking(urls, 'categories', filename);

    if (!path) return null;

    // Update category image
    await prisma.category.update({
      where: { id: categoryId },
      data: { image: `/uploads/${path}` },
    });

    return `/uploads/${path}`;
  }

  private async setBrandImage(brandId: string, urls: string[]): Promise<string | null> {
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    });

    if (!brand) return null;

    const filename = `${crypto.createHash('md5').update(brand.name).digest('hex').slice(0, 8)}.jpg`;
    const path = await this.downloadFirstWorking(urls, 'brands', filename);

    if (!path) return null;

    // Update brand logo
    await prisma.brand.update({
      where: { id: brandId },
      data: { logo: `/uploads/${path}` },
    });

    return `/uploads/${path}`;
  }

  private async downloadFirstWorking(urls: string[], directory: string, filename: string): Promise<string | null> {
    for (const url of urls) {
      const path = await this.download(url, directory, filename);
      if (path) return path;
    }
    return null;
  }

  private async download(url: string, directory: string, filename: string): Promise<string | null> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 30000,
        maxRedirects: 5,
        httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
      });

      if (response.status !== 200) return null;

      const body = Buffer.from(response.data);
      if (body.length < 500) return null;

      // Ensure uploads directory exists
      const fs = require('fs');
      const path = require('path');
      const uploadDir = path.join(process.cwd(), '..', 'frontend', 'public', 'uploads', directory);
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, body);

      return `${directory}/${filename}`;
    } catch {
      return null;
    }
  }
}

export const aiImageController = new AiImageController();
