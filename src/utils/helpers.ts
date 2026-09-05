import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';

export function generateSlug(text: string): string {
  return slugify(text, { lower: true, strict: true });
}

export function generateSKU(productName: string, variant?: string): string {
  const prefix = productName.substring(0, 3).toUpperCase();
  const id = uuidv4().substring(0, 6).toUpperCase();
  const variantSuffix = variant ? `-${variant.substring(0, 3).toUpperCase()}` : '';
  return `${prefix}-${id}${variantSuffix}`;
}

export function generateOrderNumber(): string {
  const date = new Date();
  const prefix = 'ORD';
  const dateStr = date.getFullYear().toString().slice(-2) +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${dateStr}-${random}`;
}

export function generateInvoiceNumber(): string {
  const date = new Date();
  const prefix = 'INV';
  const dateStr = date.getFullYear().toString().slice(-2) +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${dateStr}-${random}`;
}

export function parsePagination(page?: string, limit?: string) {
  const p = Math.max(1, parseInt(page || '1', 10));
  const l = Math.min(100, Math.max(1, parseInt(limit || '20', 10)));
  const skip = (p - 1) * l;
  return { page: p, limit: l, skip };
}

export function calculateDiscount(originalPrice: number, discountType: string, discountValue: number): number {
  if (discountType === 'percentage') {
    return originalPrice * (discountValue / 100);
  }
  return Math.min(originalPrice, discountValue);
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100);
}

export function classNames(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
