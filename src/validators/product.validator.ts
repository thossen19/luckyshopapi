import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(255),
    description: z.string().optional(),
    shortDescription: z.string().optional(),
    type: z.enum(['SIMPLE', 'VARIABLE', 'DIGITAL', 'SUBSCRIPTION', 'BUNDLE', 'SERVICE']).default('SIMPLE'),
    categoryId: z.string().uuid().optional(),
    brandId: z.string().uuid().optional(),
    price: z.coerce.number().min(0, 'Price must be positive'),
    costPrice: z.coerce.number().min(0).optional(),
    salePrice: z.coerce.number().min(0).optional(),
    taxRate: z.coerce.number().min(0).max(100).optional(),
    weight: z.coerce.number().min(0).optional(),
    length: z.coerce.number().min(0).optional(),
    width: z.coerce.number().min(0).optional(),
    height: z.coerce.number().min(0).optional(),
    stockQuantity: z.coerce.number().min(0).default(0),
    lowStockThreshold: z.coerce.number().min(0).default(5),
    trackInventory: z.boolean().default(true),
    allowBackorder: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
    isDigital: z.boolean().default(false),
    tags: z.string().optional(),
    metaTitle: z.string().max(255).optional(),
    metaDescription: z.string().optional(),
    variants: z.array(z.object({
      name: z.string().min(1),
      price: z.coerce.number().min(0),
      costPrice: z.coerce.number().min(0).optional(),
      stockQuantity: z.coerce.number().min(0).default(0),
      optionValues: z.record(z.string()).optional(),
    })).optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: createProductSchema.shape.body.partial(),
});

export const productQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    brandId: z.string().uuid().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    inStock: z.string().optional(),
    sortBy: z.enum(['name', 'price', 'createdAt', 'stockQuantity']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});
