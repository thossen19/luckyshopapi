import { z } from 'zod';

export const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(3).max(50).toUpperCase(),
    description: z.string().optional(),
    discountType: z.enum(['PERCENTAGE', 'FIXED', 'FREE_SHIPPING', 'BUY_X_GET_Y']),
    discountValue: z.coerce.number().min(0),
    minimumAmount: z.coerce.number().min(0).optional(),
    maximumDiscount: z.coerce.number().min(0).optional(),
    usageLimit: z.coerce.number().min(1).optional(),
    perCustomerLimit: z.coerce.number().min(1).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    isActive: z.boolean().default(true),
    applicableProducts: z.array(z.string().uuid()).optional(),
    applicableCategories: z.array(z.string().uuid()).optional(),
  }),
});

export const updateCouponSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: createCouponSchema.shape.body.partial(),
});

export const createPromotionSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    type: z.enum(['PERCENTAGE_OFF', 'FIXED_OFF', 'BUY_X_GET_Y', 'FREE_SHIPPING', 'FLASH_SALE']),
    value: z.coerce.number().min(0),
    buyQuantity: z.coerce.number().min(1).optional(),
    getQuantity: z.coerce.number().min(1).optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    isActive: z.boolean().default(true),
    priority: z.coerce.number().default(0),
    productIds: z.array(z.string().uuid()).optional(),
    categoryIds: z.array(z.string().uuid()).optional(),
  }),
});

export const updatePromotionSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: createPromotionSchema.shape.body.partial(),
});

export const createCustomerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    phone: z.string().optional(),
    segment: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const createExpenseSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    amount: z.coerce.number().min(0.01),
    category: z.string().min(1),
    date: z.coerce.date(),
    receipt: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const createReviewSchema = z.object({
  body: z.object({
    productId: z.string().uuid(),
    rating: z.coerce.number().min(1).max(5),
    title: z.string().max(255).optional(),
    comment: z.string().optional(),
  }),
});
