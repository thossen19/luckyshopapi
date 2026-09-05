import express, { Application, Router, RequestHandler, ErrorRequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { tenantScope } from './middleware/tenant';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import storeRoutes from './routes/store.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import brandRoutes from './routes/brand.routes';
import attributeRoutes from './routes/attribute.routes';
import customerRoutes from './routes/customer.routes';
import orderRoutes from './routes/order.routes';
import cartRoutes from './routes/cart.routes';
import paymentRoutes from './routes/payment.routes';
import inventoryRoutes from './routes/inventory.routes';
import supplierRoutes from './routes/supplier.routes';
import purchaseRoutes from './routes/purchase.routes';
import couponRoutes from './routes/coupon.routes';
import promotionRoutes from './routes/promotion.routes';
import campaignRoutes from './routes/campaign.routes';
import reviewRoutes from './routes/review.routes';
import wishlistRoutes from './routes/wishlist.routes';
import analyticsRoutes from './routes/analytics.routes';
import aiRoutes from './routes/ai.routes';
import aiImageRoutes from './routes/ai-image.routes';
import subscriptionRoutes from './routes/subscription.routes';
import notificationRoutes from './routes/notification.routes';
import loyaltyRoutes from './routes/loyalty.routes';
import walletRoutes from './routes/wallet.routes';
import addressRoutes from './routes/address.routes';
import expenseRoutes from './routes/expense.routes';
import settingsRoutes from './routes/settings.routes';
import mediaRoutes from './routes/media.routes';
import dashboardRoutes from './routes/dashboard.routes';
import homepageSlideRoutes from './routes/homepage-slide.routes';
import customPageRoutes from './routes/custom-page.routes';
import menuRoutes from './routes/menu.routes';
import paymentMethodRoutes from './routes/payment-method.routes';
import uploadRoutes from './routes/uploads';
import searchRoutes from './routes/search';
import trackOrderRoutes from './routes/track-order';

/**
 * Wraps a handler (or middleware array) so async handlers that reject
 * forward the error to next() instead of leaving the request hanging
 * as an unhandled promise rejection.
 */
function safeHandler(handler: any): any {
  if (Array.isArray(handler)) return handler.map(safeHandler);
  if (typeof handler !== 'function') return handler;
  // Skip error-handling middleware (4 args) and already-safe handlers
  if (handler.length >= 4 || (handler as any).__asyncWrapped) return handler;
  const wrapped: RequestHandler = (req, res, next) => {
    try {
      const result = handler(req, res, next);
      if (result && typeof result.catch === 'function') {
        result.catch(next);
      }
    } catch (err) {
      next(err);
    }
  };
  (wrapped as any).__asyncWrapped = true;
  return wrapped;
}

/** Recursively wrap all route handlers registered on a router. */
function wrapRouter(router: any): any {
  const stack = router && router.stack;
  if (!Array.isArray(stack)) return router;
  for (const layer of stack) {
    const route = layer && layer.route;
    if (route) {
      for (const method of Object.keys(route.methods)) {
        const chain = route.stack;
        for (let i = 0; i < chain.length; i++) {
          chain[i].handle = safeHandler(chain[i].handle);
        }
      }
      // Recurse into nested routers mounted on this route
      for (const layer2 of route.stack || []) {
        const inner = layer2.handle;
        if (inner && Array.isArray(inner.stack)) wrapRouter(inner);
      }
    }
    // Nested routers mounted via router.use
    if (layer.name === 'router' && layer.handle && Array.isArray(layer.handle.stack)) {
      wrapRouter(layer.handle);
    }
  }
  return router;
}

/** Registers a router with async-safety applied to every handler. */
function useAsync(path: string, router: Router) {
  app.use(path, wrapRouter(router));
}

const app: Application = express();

// Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: [config.frontendUrl, config.adminUrl],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression
app.use(compression());

// Logging
app.use(morgan('combined', {
  stream: { write: (message: string) => logger.info(message.trim()) },
}));

// Static files
app.use('/uploads', express.static('uploads'));

// Tenant scope
app.use('/api', tenantScope);

// API Routes
useAsync('/api/v1/auth', authRoutes);
useAsync('/api/v1/users', userRoutes);
useAsync('/api/v1/stores', storeRoutes);
useAsync('/api/v1/products', productRoutes);
useAsync('/api/v1/categories', categoryRoutes);
useAsync('/api/v1/brands', brandRoutes);
useAsync('/api/v1/attributes', attributeRoutes);
useAsync('/api/v1/customers', customerRoutes);
useAsync('/api/v1/orders', orderRoutes);
useAsync('/api/v1/cart', cartRoutes);
useAsync('/api/v1/payments', paymentRoutes);
useAsync('/api/v1/payment-methods', paymentMethodRoutes);
useAsync('/api/v1/inventory', inventoryRoutes);
useAsync('/api/v1/suppliers', supplierRoutes);
useAsync('/api/v1/purchases', purchaseRoutes);
useAsync('/api/v1/coupons', couponRoutes);
useAsync('/api/v1/promotions', promotionRoutes);
useAsync('/api/v1/campaigns', campaignRoutes);
useAsync('/api/v1/reviews', reviewRoutes);
useAsync('/api/v1/wishlist', wishlistRoutes);
useAsync('/api/v1/analytics', analyticsRoutes);
useAsync('/api/v1/ai', aiRoutes);
useAsync('/api/v1/ai/image', aiImageRoutes);
useAsync('/api/v1/subscriptions', subscriptionRoutes);
useAsync('/api/v1/notifications', notificationRoutes);
useAsync('/api/v1/loyalty', loyaltyRoutes);
useAsync('/api/v1/wallet', walletRoutes);
useAsync('/api/v1/addresses', addressRoutes);
useAsync('/api/v1/expenses', expenseRoutes);
useAsync('/api/v1/settings', settingsRoutes);
useAsync('/api/v1/media', mediaRoutes);
useAsync('/api/v1/dashboard', dashboardRoutes);
useAsync('/api/v1/homepage-slides', homepageSlideRoutes);
useAsync('/api/v1/pages', customPageRoutes);
useAsync('/api/v1/menus', menuRoutes);
useAsync('/api/v1/uploads', uploadRoutes);
useAsync('/api/v1/search', searchRoutes);
useAsync('/api/v1/track-order', trackOrderRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
