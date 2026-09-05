import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  storeId?: string | null;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export interface StoreContext {
  storeId: string;
  userId: string;
}

export interface DashboardMetrics {
  revenue: number;
  orders: number;
  customers: number;
  products: number;
  todaySales: number;
  monthlySales: number;
  averageOrderValue: number;
  conversionRate: number;
}

export interface DateRange {
  startDate?: string;
  endDate?: string;
}

export interface ProductFilter extends PaginationQuery {
  search?: string;
  categoryId?: string;
  categorySlug?: string;
  brandId?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
  tag?: string;
}

export interface OrderFilter extends PaginationQuery {
  status?: string;
  startDate?: string;
  endDate?: string;
  customerId?: string;
  search?: string;
}

export interface CustomerFilter extends PaginationQuery {
  search?: string;
  segment?: string;
  minSpent?: string;
  maxSpent?: string;
}
