import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(255),
    description: z.string().optional(),
    parentId: z.string().uuid().optional(),
    sortOrder: z.coerce.number().default(0),
    isActive: z.boolean().default(true),
    seoTitle: z.string().max(255).optional(),
    seoDescription: z.string().optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: createCategorySchema.shape.body.partial(),
});

export const createBrandSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(255),
    description: z.string().optional(),
    website: z.string().url().optional(),
    isActive: z.boolean().default(true),
  }),
});

export const updateBrandSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: createBrandSchema.shape.body.partial(),
});

export const createOrderSchema = z.object({
  body: z.object({
    customerId: z.string().uuid().optional(),
    items: z.array(z.object({
      productId: z.string().uuid(),
      variantId: z.string().uuid().optional(),
      quantity: z.coerce.number().min(1),
    })).min(1, 'At least one item required'),
    shippingAddress: z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      address1: z.string().min(1),
      address2: z.string().optional(),
      city: z.string().min(1),
      state: z.string().optional(),
      zipCode: z.string().min(1),
      country: z.string().min(1),
      phone: z.string().optional(),
    }),
    billingAddress: z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      address1: z.string().min(1),
      address2: z.string().optional(),
      city: z.string().min(1),
      state: z.string().optional(),
      zipCode: z.string().min(1),
      country: z.string().min(1),
    }).optional(),
    shippingMethod: z.string().optional(),
    paymentMethod: z.string().min(1, 'Payment method is required'),
    couponCode: z.string().optional(),
    customerNote: z.string().optional(),
    useLoyaltyPoints: z.boolean().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED']),
    note: z.string().optional(),
  }),
});
