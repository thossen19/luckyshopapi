import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function generateEAN13(): string {
  const prefix = '590';
  let manufacturer = '';
  for (let i = 0; i < 5; i++) manufacturer += Math.floor(Math.random() * 10).toString();
  let product = '';
  for (let i = 0; i < 4; i++) product += Math.floor(Math.random() * 10).toString();
  const base = prefix + manufacturer + product;
  let sum = 0;
  for (let i = 0; i < base.length; i++) {
    const n = parseInt(base[i], 10);
    sum += (base.length - i) % 2 === 0 ? n * 3 : n;
  }
  const check = (10 - (sum % 10)) % 10;
  return base + check.toString();
}

async function main() {
  console.log('Seeding database...');

  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0`;
  await prisma.inventoryTransaction.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.address.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.user.deleteMany();
  await prisma.store.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1`;

  console.log('Cleaned existing data');

  const plans = await prisma.subscriptionPlan.createMany({
    data: [
      { name: 'Starter', slug: 'starter', price: 29.99, maxProducts: 100, maxEmployees: 2, maxStorage: 1024, features: ['Basic analytics', 'Email support'] },
      { name: 'Professional', slug: 'professional', price: 79.99, maxProducts: 1000, maxEmployees: 5, maxStorage: 5120, features: ['Advanced analytics', 'Priority support', 'Custom domain'] },
      { name: 'Business', slug: 'business', price: 149.99, maxProducts: 5000, maxEmployees: 15, maxStorage: 20480, features: ['All features', 'API access', 'White label'] },
      { name: 'Enterprise', slug: 'enterprise', price: 299.99, maxProducts: 999999, maxEmployees: 999, maxStorage: 102400, features: ['Unlimited everything', 'Dedicated support', 'Custom integrations'] },
      { name: 'Trial', slug: 'trial', price: 0, maxProducts: 10, maxEmployees: 1, maxStorage: 256, features: ['14-day trial', 'Basic features'] },
    ],
  });
  console.log('Created 5 subscription plans');

  const superAdminPassword = await bcrypt.hash('Admin123!', 12);
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@aisaasecommerce.com',
      password: superAdminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      isActive: true,
      emailVerified: true,
    },
  });
  console.log('Created super admin: admin@aisaasecommerce.com');

  const storeOwnerPassword = await bcrypt.hash('Owner123!', 12);
  const storeOwner = await prisma.user.create({
    data: {
      email: 'owner@demo.com',
      password: storeOwnerPassword,
      firstName: 'John',
      lastName: 'Merchant',
      role: 'STORE_OWNER',
      isActive: true,
      emailVerified: true,
    },
  });

  const store = await prisma.store.create({
    data: {
      name: 'Demo Store',
      slug: 'demo-store',
      description: 'A fully-featured demo store showcasing all platform capabilities.',
      email: 'store@demo.com',
      phone: '+1-555-0100',
      address: '123 Commerce St',
      city: 'New York',
      state: 'NY',
      country: 'US',
      zipCode: '10001',
      currency: 'USD',
      language: 'en',
      isActive: true,
      settings: {
        create: {
          taxRate: 8.875,
          taxEnabled: true,
          shippingEnabled: true,
          freeShippingThreshold: 75,
          flatShippingRate: 9.99,
          currency: 'USD',
        },
      },
    },
    include: { settings: true },
  });

  await prisma.user.update({ where: { id: storeOwner.id }, data: { storeId: store.id } });

  const businessPlan = await prisma.subscriptionPlan.findFirst({ where: { slug: 'business' } });
  await prisma.subscription.create({
    data: {
      storeId: store.id,
      planId: businessPlan!.id,
      status: 'ACTIVE',
      amount: 149.99,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // ==================== CAMPAIGNS ====================
  await prisma.campaign.createMany({
    data: [
      { name: 'Summer Sale 2026', type: 'EMAIL', description: 'Summer sale announcement to all customers', content: 'Check out our amazing summer deals!', scheduledAt: new Date('2026-06-01'), sentAt: new Date('2026-06-01'), status: 'SENT', recipients: [{ segment: 'all', count: 150 }], metrics: { sent: 150, opened: 89, clicked: 42, converted: 12, revenue: 2450 }, storeId: store.id },
      { name: 'New Year Promo', type: 'EMAIL', description: 'New year special offers', content: 'Happy New Year! Enjoy 30% off on all items', scheduledAt: new Date('2026-01-01'), sentAt: new Date('2026-01-01'), status: 'SENT', recipients: [{ segment: 'all', count: 120 }], metrics: { sent: 120, opened: 78, clicked: 35, converted: 15, revenue: 3200 }, storeId: store.id },
      { name: 'Flash Sale Alert', type: 'SMS', description: '24 hours flash sale notification', content: 'Flash Sale! 50% off for 24 hours only!', scheduledAt: new Date('2026-08-15'), sentAt: new Date('2026-08-15'), status: 'SENT', recipients: [{ segment: 'vip', count: 45 }], metrics: { sent: 45, opened: 38, clicked: 28, converted: 18, revenue: 5600 }, storeId: store.id },
      { name: 'Back to School', type: 'EMAIL', description: 'Back to school essentials promotion', content: 'Get ready for school with our special offers', scheduledAt: new Date('2026-08-20'), sentAt: new Date('2026-08-20'), status: 'SENT', recipients: [{ segment: 'all', count: 150 }], metrics: { sent: 150, opened: 95, clicked: 52, converted: 22, revenue: 4100 }, storeId: store.id },
      { name: 'Holiday Gift Guide', type: 'EMAIL', description: 'Holiday season gift recommendations', content: 'Find the perfect gift for your loved ones', scheduledAt: new Date('2026-12-01'), sentAt: null, status: 'SCHEDULED', recipients: [{ segment: 'all', count: 0 }], metrics: {}, storeId: store.id },
      { name: 'VIP Exclusive', type: 'PUSH', description: 'Exclusive offer for VIP customers', content: 'VIP only: Extra 20% off on premium items', scheduledAt: new Date('2026-09-15'), sentAt: new Date('2026-09-15'), status: 'SENT', recipients: [{ segment: 'vip', count: 25 }], metrics: { sent: 25, opened: 23, clicked: 19, converted: 12, revenue: 4800 }, storeId: store.id },
      { name: 'Abandoned Cart Recovery', type: 'EMAIL', description: 'Reminder for abandoned carts', content: 'You left items in your cart! Complete your order now', scheduledAt: new Date('2026-09-01'), sentAt: new Date('2026-09-01'), status: 'SENT', recipients: [{ segment: 'abandoned_cart', count: 35 }], metrics: { sent: 35, opened: 22, clicked: 15, converted: 8, revenue: 1800 }, storeId: store.id },
      { name: 'Product Launch', type: 'SMS', description: 'New product launch announcement', content: 'New arrival! Check out our latest collection', scheduledAt: new Date('2026-10-01'), sentAt: null, status: 'SCHEDULED', recipients: [{ segment: 'all', count: 0 }], metrics: {}, storeId: store.id },
      { name: 'Black Friday Early Access', type: 'EMAIL', description: 'Early access to Black Friday deals', content: 'Exclusive early access to Black Friday sale', scheduledAt: new Date('2026-11-20'), sentAt: null, status: 'DRAFT', recipients: [], metrics: {}, storeId: store.id },
      { name: 'Thanksgiving Special', type: 'PUSH', description: 'Thanksgiving day special offers', content: 'Happy Thanksgiving! Special deals just for you', scheduledAt: new Date('2026-11-27'), sentAt: null, status: 'SCHEDULED', recipients: [{ segment: 'all', count: 0 }], metrics: {}, storeId: store.id },
    ],
  });
  console.log('Created 10 campaigns');

  // ==================== PROMOTIONS ====================
  await prisma.promotion.createMany({
    data: [
      { name: 'Summer Sale 50% Off', description: 'Get 50% off on all summer collection items', type: 'PERCENTAGE_OFF', value: 50, startDate: new Date('2026-06-01'), endDate: new Date('2026-08-31'), isActive: false, priority: 10, storeId: store.id },
      { name: '$20 Off Orders $100+', description: 'Save $20 when you spend $100 or more', type: 'FIXED_OFF', value: 20, startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'), isActive: true, priority: 5, storeId: store.id },
      { name: 'Buy 2 Get 1 Free', description: 'Buy any 2 items and get the 3rd one free', type: 'BUY_X_GET_Y', value: 0, buyQuantity: 2, getQuantity: 1, startDate: new Date('2026-09-01'), endDate: new Date('2026-12-31'), isActive: true, priority: 8, storeId: store.id },
      { name: 'Free Shipping Weekend', description: 'Free shipping on all orders this weekend', type: 'FREE_SHIPPING', value: 0, startDate: new Date(), endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), isActive: true, priority: 15, storeId: store.id },
      { name: 'Flash Friday', description: 'Massive discounts every Friday from 3PM to 9PM', type: 'FLASH_SALE', value: 30, startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'), isActive: true, priority: 20, storeId: store.id },
      { name: 'New Year 25% Off', description: 'Celebrate the new year with 25% off everything', type: 'PERCENTAGE_OFF', value: 25, startDate: new Date('2026-01-01'), endDate: new Date('2026-01-31'), isActive: false, priority: 10, storeId: store.id },
      { name: 'Student Discount', description: 'Students get 15% off with valid student ID', type: 'PERCENTAGE_OFF', value: 15, startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'), isActive: true, priority: 3, storeId: store.id },
      { name: 'Black Friday Mega Sale', description: 'Up to 70% off on selected items during Black Friday', type: 'FLASH_SALE', value: 70, startDate: new Date('2026-11-27'), endDate: new Date('2026-11-30'), isActive: false, priority: 25, storeId: store.id },
      { name: 'Spring Clearance', description: 'Clearance sale - Up to 40% off spring items', type: 'PERCENTAGE_OFF', value: 40, startDate: new Date('2026-03-01'), endDate: new Date('2026-05-31'), isActive: false, priority: 8, storeId: store.id },
      { name: 'VIP Exclusive 30% Off', description: 'VIP members get an extra 30% off', type: 'PERCENTAGE_OFF', value: 30, startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'), isActive: true, priority: 12, storeId: store.id },
      { name: 'First Order $10 Off', description: 'New customers get $10 off their first order', type: 'FIXED_OFF', value: 10, startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'), isActive: true, priority: 7, storeId: store.id },
      { name: 'Buy 3 Pay for 2', description: 'Buy 3 items and only pay for 2', type: 'BUY_X_GET_Y', value: 0, buyQuantity: 3, getQuantity: 1, startDate: new Date('2026-10-01'), endDate: new Date('2026-10-31'), isActive: false, priority: 9, storeId: store.id },
    ],
  });
  console.log('Created 12 promotions');

  // ==================== CATEGORIES ====================
  const electronics = await prisma.category.create({
    data: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Latest gadgets, devices, and tech accessories',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop',
      storeId: store.id,
      sortOrder: 1,
      isActive: true,
    },
  });
  const clothing = await prisma.category.create({
    data: {
      name: 'Clothing',
      slug: 'clothing',
      description: 'Fashion and apparel for all seasons',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop',
      storeId: store.id,
      sortOrder: 2,
      isActive: true,
    },
  });
  const homeGarden = await prisma.category.create({
    data: {
      name: 'Home & Garden',
      slug: 'home-garden',
      description: 'Everything for your home and garden',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
      storeId: store.id,
      sortOrder: 3,
      isActive: true,
    },
  });
  const sports = await prisma.category.create({
    data: {
      name: 'Sports & Outdoors',
      slug: 'sports-outdoors',
      description: 'Gear and equipment for active lifestyles',
      image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=400&fit=crop',
      storeId: store.id,
      sortOrder: 4,
      isActive: true,
    },
  });
  const beauty = await prisma.category.create({
    data: {
      name: 'Beauty & Health',
      slug: 'beauty-health',
      description: 'Skincare, cosmetics, and wellness products',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
      storeId: store.id,
      sortOrder: 5,
      isActive: true,
    },
  });
  const books = await prisma.category.create({
    data: {
      name: 'Books & Media',
      slug: 'books-media',
      description: 'Books, e-books, and digital media',
      image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=400&fit=crop',
      storeId: store.id,
      sortOrder: 6,
      isActive: true,
    },
  });
  const toys = await prisma.category.create({
    data: {
      name: 'Toys & Games',
      slug: 'toys-games',
      description: 'Fun and educational toys for all ages',
      image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=400&fit=crop',
      storeId: store.id,
      sortOrder: 7,
      isActive: true,
    },
  });
  const food = await prisma.category.create({
    data: {
      name: 'Food & Beverages',
      slug: 'food-beverages',
      description: 'Gourmet food, drinks, and snacks',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop',
      storeId: store.id,
      sortOrder: 8,
      isActive: true,
    },
  });

  // Sub-categories
  await prisma.category.createMany({
    data: [
      { name: 'Smartphones', slug: 'smartphones', description: 'Mobile phones and accessories', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop', parentId: electronics.id, storeId: store.id, sortOrder: 1, isActive: true },
      { name: 'Laptops', slug: 'laptops', description: 'Notebooks and ultrabooks', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop', parentId: electronics.id, storeId: store.id, sortOrder: 2, isActive: true },
      { name: 'Headphones', slug: 'headphones', description: 'Audio devices and accessories', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', parentId: electronics.id, storeId: store.id, sortOrder: 3, isActive: true },
      { name: 'Men\'s Fashion', slug: 'mens-fashion', description: 'Clothing for men', image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=400&h=400&fit=crop', parentId: clothing.id, storeId: store.id, sortOrder: 1, isActive: true },
      { name: 'Women\'s Fashion', slug: 'womens-fashion', description: 'Clothing for women', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop', parentId: clothing.id, storeId: store.id, sortOrder: 2, isActive: true },
      { name: 'Kids Fashion', slug: 'kids-fashion', description: 'Clothing for children', image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&h=400&fit=crop', parentId: clothing.id, storeId: store.id, sortOrder: 3, isActive: true },
      { name: 'Furniture', slug: 'furniture', description: 'Home and office furniture', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop', parentId: homeGarden.id, storeId: store.id, sortOrder: 1, isActive: true },
      { name: 'Kitchen', slug: 'kitchen', description: 'Kitchen appliances and tools', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop', parentId: homeGarden.id, storeId: store.id, sortOrder: 2, isActive: true },
      { name: 'Fitness', slug: 'fitness', description: 'Exercise and fitness equipment', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop', parentId: sports.id, storeId: store.id, sortOrder: 1, isActive: true },
      { name: 'Outdoor Gear', slug: 'outdoor-gear', description: 'Camping and outdoor equipment', image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=400&fit=crop', parentId: sports.id, storeId: store.id, sortOrder: 2, isActive: true },
    ],
  });
  console.log('Created 18 categories');

  // ==================== BRANDS ====================
  await prisma.brand.createMany({
    data: [
      { name: 'TechPro', slug: 'techpro', description: 'Premium electronics and gadgets', storeId: store.id, isActive: true },
      { name: 'StyleHub', slug: 'stylehub', description: 'Trendy fashion and accessories', storeId: store.id, isActive: true },
      { name: 'HomeEssentials', slug: 'homeessentials', description: 'Quality home and living products', storeId: store.id, isActive: true },
      { name: 'SportMax', slug: 'sportmax', description: 'Professional sports equipment', storeId: store.id, isActive: true },
      { name: 'BeautyGlow', slug: 'beautyglow', description: 'Natural beauty and skincare', storeId: store.id, isActive: true },
      { name: 'BookWorld', slug: 'bookworld', description: 'Books and educational materials', storeId: store.id, isActive: true },
      { name: 'PlayFun', slug: 'playfun', description: 'Educational and fun toys', storeId: store.id, isActive: true },
      { name: 'FreshFoods', slug: 'freshfoods', description: 'Organic and fresh food products', storeId: store.id, isActive: true },
    ],
  });
  console.log('Created 8 brands');

  // ==================== PRODUCTS ====================
  const brands = await prisma.brand.findMany({ where: { storeId: store.id } });
  const categories = await prisma.category.findMany({ where: { storeId: store.id } });

  const productData: Record<string, Array<{ name: string; slug: string; description: string; price: number; image: string; stock: number }>> = {
      Electronics: [
        { name: 'iPhone 15 Pro Max', slug: 'iphone-15-pro-max', description: 'Latest Apple smartphone with A17 Pro chip, titanium design, and advanced camera system', price: 1199, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop', stock: 50 },
        { name: 'Samsung Galaxy S24 Ultra', slug: 'samsung-galaxy-s24-ultra', description: 'Premium Android smartphone with S Pen and 200MP camera', price: 1299, image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop', stock: 45 },
        { name: 'MacBook Pro 16"', slug: 'macbook-pro-16', description: 'Powerful laptop with M3 Pro chip for professionals', price: 2499, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop', stock: 30 },
        { name: 'Sony WH-1000XM5', slug: 'sony-wh-1000xm5', description: 'Industry-leading noise canceling headphones', price: 399, image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=400&fit=crop', stock: 100 },
        { name: 'iPad Air M2', slug: 'ipad-air-m2', description: 'Versatile tablet for work and play with M2 chip', price: 599, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop', stock: 60 },
        { name: 'Apple Watch Ultra 2', slug: 'apple-watch-ultra-2', description: 'Rugged smartwatch for outdoor adventures', price: 799, image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop', stock: 75 },
        { name: 'Dell XPS 15', slug: 'dell-xps-15', description: 'Premium Windows laptop with OLED display', price: 1899, image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=400&fit=crop', stock: 25 },
        { name: 'AirPods Pro 2', slug: 'airpods-pro-2', description: 'Active noise cancellation earbuds with spatial audio', price: 249, image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&h=400&fit=crop', stock: 150 },
        { name: 'PlayStation 5', slug: 'playstation-5', description: 'Next-gen gaming console with lightning-fast SSD', price: 499, image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=400&fit=crop', stock: 40 },
        { name: 'Canon EOS R6', slug: 'canon-eos-r6', description: 'Full-frame mirrorless camera for professionals', price: 2499, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop', stock: 20 },
      ],
      Clothing: [
        { name: 'Classic Leather Jacket', slug: 'classic-leather-jacket', description: 'Timeless genuine leather jacket with quilted lining', price: 299, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop', stock: 75 },
        { name: 'Summer Floral Dress', slug: 'summer-floral-dress', description: 'Elegant floral print dress perfect for summer', price: 89, image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop', stock: 120 },
        { name: 'Denim Jeans Slim Fit', slug: 'denim-jeans-slim-fit', description: 'Comfortable slim fit jeans with stretch fabric', price: 79, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop', stock: 200 },
        { name: 'Cotton T-Shirt Pack', slug: 'cotton-tshirt-pack', description: 'Pack of 5 premium cotton t-shirts in assorted colors', price: 49, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', stock: 300 },
        { name: 'Wool Overcoat', slug: 'wool-overcoat', description: 'Classic wool overcoat for cold weather', price: 349, image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=400&fit=crop', stock: 50 },
        { name: 'Silk Blouse', slug: 'silk-blouse', description: 'Luxurious silk blouse for formal occasions', price: 129, image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400&h=400&fit=crop', stock: 80 },
        { name: 'Athletic Joggers', slug: 'athletic-joggers', description: 'Comfortable joggers for workouts and casual wear', price: 59, image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400&h=400&fit=crop', stock: 150 },
        { name: 'Linen Shirt', slug: 'linen-shirt', description: 'Breathable linen shirt for summer days', price: 69, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop', stock: 100 },
        { name: 'Knit Sweater', slug: 'knit-sweater', description: 'Cozy knit sweater with cable pattern', price: 89, image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop', stock: 90 },
        { name: 'Formal Suit', slug: 'formal-suit', description: 'Tailored formal suit for business and events', price: 499, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop', stock: 35 },
      ],
      'Home & Garden': [
        { name: 'Ergonomic Office Chair', slug: 'ergonomic-office-chair', description: 'Comfortable chair with lumbar support for long work hours', price: 449, image: 'https://images.unsplash.com/photo-1580480055497-93f11b2e5b23?w=400&h=400&fit=crop', stock: 40 },
        { name: 'Smart Coffee Maker', slug: 'smart-coffee-maker', description: 'WiFi-enabled coffee machine with app control', price: 199, image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&h=400&fit=crop', stock: 80 },
        { name: 'Modern Sofa Set', slug: 'modern-sofa-set', description: '3-piece contemporary sofa set for living room', price: 1299, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop', stock: 15 },
        { name: 'Standing Desk', slug: 'standing-desk', description: 'Adjustable height desk for ergonomic workspace', price: 599, image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=400&fit=crop', stock: 30 },
        { name: 'Table Lamp', slug: 'table-lamp', description: 'Modern LED table lamp with touch control', price: 79, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop', stock: 120 },
        { name: 'Plant Pot Set', slug: 'plant-pot-set', description: 'Set of 3 ceramic plant pots for indoor plants', price: 49, image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=400&fit=crop', stock: 100 },
        { name: 'Throw Blanket', slug: 'throw-blanket', description: 'Soft knitted throw blanket for couch or bed', price: 59, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop', stock: 150 },
        { name: 'Wall Art Canvas', slug: 'wall-art-canvas', description: 'Abstract modern wall art canvas print', price: 89, image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400&h=400&fit=crop', stock: 75 },
        { name: 'Kitchen Knife Set', slug: 'kitchen-knife-set', description: 'Professional chef knife set with block', price: 149, image: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=400&h=400&fit=crop', stock: 60 },
        { name: 'Air Purifier', slug: 'air-purifier', description: 'HEPA air purifier for clean indoor air', price: 249, image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop', stock: 45 },
      ],
      'Sports & Outdoors': [
        { name: 'Yoga Mat Premium', slug: 'yoga-mat-premium', description: 'Non-slip exercise yoga mat with carrying strap', price: 45, image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop', stock: 150 },
        { name: 'Running Shoes Pro', slug: 'running-shoes-pro', description: 'Lightweight performance running shoes', price: 159, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', stock: 100 },
        { name: 'Adjustable Dumbbells', slug: 'adjustable-dumbbells', description: 'Space-saving adjustable dumbbell set', price: 299, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop', stock: 40 },
        { name: 'Tennis Racket', slug: 'tennis-racket', description: 'Professional graphite tennis racket', price: 179, image: 'https://images.unsplash.com/photo-1617083934555-ac7d4a2c19e4?w=400&h=400&fit=crop', stock: 60 },
        { name: 'Camping Tent 4P', slug: 'camping-tent-4p', description: 'Waterproof 4-person camping tent', price: 249, image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=400&fit=crop', stock: 35 },
        { name: 'Mountain Bike', slug: 'mountain-bike', description: 'Full suspension mountain bike for trails', price: 899, image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400&h=400&fit=crop', stock: 20 },
        { name: 'Fitness Tracker', slug: 'fitness-tracker', description: 'Advanced fitness tracker with heart rate monitor', price: 129, image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&h=400&fit=crop', stock: 120 },
        { name: 'Basketball', slug: 'basketball', description: 'Official size indoor/outdoor basketball', price: 39, image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=400&fit=crop', stock: 80 },
        { name: 'Swimming Goggles', slug: 'swimming-goggles', description: 'Anti-fog UV protection swimming goggles', price: 29, image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=400&fit=crop', stock: 150 },
        { name: 'Hiking Backpack', slug: 'hiking-backpack', description: '40L waterproof hiking backpack', price: 119, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop', stock: 70 },
      ],
      'Beauty & Health': [
        { name: 'Vitamin C Serum', slug: 'vitamin-c-serum', description: 'Brightening facial serum with hyaluronic acid', price: 35, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop', stock: 200 },
        { name: 'Organic Face Cream', slug: 'organic-face-cream', description: 'Natural moisturizing face cream for all skin types', price: 55, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop', stock: 150 },
        { name: 'Sunscreen SPF 50', slug: 'sunscreen-spf-50', description: 'Lightweight broad spectrum sunscreen', price: 25, image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop', stock: 180 },
        { name: 'Hair Dryer Pro', slug: 'hair-dryer-pro', description: 'Ionic hair dryer with multiple heat settings', price: 129, image: 'https://images.unsplash.com/photo-1522338242992-e1a54571a9f7?w=400&h=400&fit=crop', stock: 60 },
        { name: 'Electric Toothbrush', slug: 'electric-toothbrush', description: 'Sonic electric toothbrush with timer', price: 89, image: 'https://images.unsplash.com/photo-1559591937-abc1f1ba8af4?w=400&h=400&fit=crop', stock: 100 },
        { name: 'Essential Oil Set', slug: 'essential-oil-set', description: 'Set of 6 pure essential oils for aromatherapy', price: 45, image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop', stock: 120 },
        { name: 'Makeup Brush Set', slug: 'makeup-brush-set', description: 'Professional 12-piece makeup brush set', price: 69, image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop', stock: 90 },
        { name: 'Anti-Aging Cream', slug: 'anti-aging-cream', description: 'Retinol-based anti-aging night cream', price: 79, image: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=400&h=400&fit=crop', stock: 85 },
        { name: 'Beard Trimmer', slug: 'beard-trimmer', description: 'Cordless beard trimmer with precision settings', price: 59, image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=400&h=400&fit=crop', stock: 75 },
        { name: 'Face Mask Pack', slug: 'face-mask-pack', description: 'Hydrating sheet mask pack of 10', price: 29, image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=400&fit=crop', stock: 200 },
      ],
      'Books & Media': [
        { name: 'The Art of Programming', slug: 'art-of-programming', description: 'Comprehensive guide to modern programming', price: 49, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop', stock: 100 },
        { name: 'Business Strategy Guide', slug: 'business-strategy-guide', description: 'Essential strategies for business success', price: 39, image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=400&fit=crop', stock: 80 },
        { name: 'Science Fiction Collection', slug: 'science-fiction-collection', description: 'Bestselling sci-fi novels box set', price: 59, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop', stock: 60 },
        { name: 'Cookbook Masterclass', slug: 'cookbook-masterclass', description: 'Gourmet recipes from world-class chefs', price: 45, image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400&h=400&fit=crop', stock: 75 },
        { name: 'Self-Help Bestseller', slug: 'self-help-bestseller', description: 'Transform your life with proven techniques', price: 29, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop', stock: 120 },
        { name: 'History of Art', slug: 'history-of-art', description: 'Illustrated history of world art', price: 55, image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop', stock: 50 },
        { name: 'Children\'s Story Book', slug: 'childrens-story-book', description: 'Illustrated story book for young readers', price: 19, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop', stock: 150 },
        { name: 'Photography Guide', slug: 'photography-guide', description: 'Master digital photography techniques', price: 42, image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&h=400&fit=crop', stock: 65 },
        { name: 'Music Theory Book', slug: 'music-theory-book', description: 'Complete guide to music theory', price: 35, image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&h=400&fit=crop', stock: 45 },
        { name: 'Travel Guide 2026', slug: 'travel-guide-2026', description: 'Ultimate travel guide for adventurers', price: 32, image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=400&fit=crop', stock: 90 },
      ],
      'Toys & Games': [
        { name: 'Building Blocks Set', slug: 'building-blocks-set', description: '500-piece creative building blocks', price: 59, image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop', stock: 80 },
        { name: 'Remote Control Car', slug: 'remote-control-car', description: 'High-speed RC car with rechargeable battery', price: 79, image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=400&fit=crop', stock: 60 },
        { name: 'Board Game Collection', slug: 'board-game-collection', description: 'Family board game collection set', price: 49, image: 'https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=400&h=400&fit=crop', stock: 70 },
        { name: 'Puzzle 1000 Pieces', slug: 'puzzle-1000-pieces', description: 'Beautiful landscape jigsaw puzzle', price: 29, image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=400&fit=crop', stock: 100 },
        { name: 'Stuffed Animal Bear', slug: 'stuffed-animal-bear', description: 'Soft plush teddy bear for kids', price: 35, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', stock: 120 },
        { name: 'Science Kit for Kids', slug: 'science-kit-for-kids', description: 'Educational science experiment kit', price: 45, image: 'https://images.unsplash.com/photo-1530099486328-e021101a494a?w=400&h=400&fit=crop', stock: 55 },
        { name: 'Action Figure Set', slug: 'action-figure-set', description: 'Set of 6 collectible action figures', price: 55, image: 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=400&h=400&fit=crop', stock: 85 },
        { name: 'Art Supply Kit', slug: 'art-supply-kit', description: 'Complete art set for young artists', price: 39, image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop', stock: 75 },
        { name: 'Drone for Beginners', slug: 'drone-for-beginners', description: 'Easy-to-fly camera drone', price: 149, image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&h=400&fit=crop', stock: 30 },
        { name: 'Card Game Set', slug: 'card-game-set', description: 'Premium playing cards and card games', price: 25, image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=400&fit=crop', stock: 140 },
      ],
      'Food & Beverages': [
        { name: 'Organic Coffee Beans', slug: 'organic-coffee-beans', description: 'Premium single-origin coffee beans 1kg', price: 29, image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop', stock: 100 },
        { name: 'Green Tea Collection', slug: 'green-tea-collection', description: 'Assorted Japanese green tea set', price: 35, image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&h=400&fit=crop', stock: 80 },
        { name: 'Dark Chocolate Box', slug: 'dark-chocolate-box', description: 'Assorted premium dark chocolates', price: 45, image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&h=400&fit=crop', stock: 120 },
        { name: 'Extra Virgin Olive Oil', slug: 'extra-virgin-olive-oil', description: 'Cold-pressed Mediterranean olive oil', price: 25, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop', stock: 90 },
        { name: 'Protein Powder', slug: 'protein-powder', description: 'Whey protein powder for fitness', price: 55, image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=400&fit=crop', stock: 70 },
        { name: 'Honey Gift Set', slug: 'honey-gift-set', description: 'Pure organic honey collection', price: 39, image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop', stock: 85 },
        { name: 'Pasta Variety Pack', slug: 'pasta-variety-pack', description: 'Italian artisan pasta assortment', price: 22, image: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=400&h=400&fit=crop', stock: 110 },
        { name: 'Spice Collection', slug: 'spice-collection', description: 'World spices gift set with 12 flavors', price: 42, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop', stock: 65 },
        { name: 'Sparkling Water Case', slug: 'sparkling-water-case', description: 'Premium sparkling water 24-pack', price: 29, image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&h=400&fit=crop', stock: 75 },
        { name: 'Gourmet Snack Box', slug: 'gourmet-snack-box', description: 'Assorted premium snacks from around the world', price: 49, image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=400&fit=crop', stock: 60 },
      ],
    };

    let totalProducts = 0;
    for (const [categoryName, products] of Object.entries(productData)) {
      const cat = categories.find(c => c.name === categoryName);
      const brand = brands.find(b => {
        const mapping: Record<string, string> = {
          Electronics: 'TechPro',
          Clothing: 'StyleHub',
          'Home & Garden': 'HomeEssentials',
          'Sports & Outdoors': 'SportMax',
          'Beauty & Health': 'BeautyGlow',
          'Books & Media': 'BookWorld',
          'Toys & Games': 'PlayFun',
          'Food & Beverages': 'FreshFoods',
        };
        return b.name === mapping[categoryName];
      });
      for (let i = 0; i < products.length; i++) {
        const p = products[i];
        // Give first 3 products in each category a sale price (30-50% off)
        const discountPercent = i < 3 ? [30, 40, 50][i] : 0;
        const salePrice = discountPercent > 0 ? Math.round(p.price * (1 - discountPercent / 100) * 100) / 100 : null;
        await prisma.product.create({
          data: {
            name: p.name,
            slug: p.slug,
            description: p.description,
            sku: `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            barcode: generateEAN13(),
            price: p.price,
            salePrice: salePrice,
            costPrice: p.price * 0.6,
            stockQuantity: p.stock,
            lowStockThreshold: 10,
            trackInventory: true,
            status: 'ACTIVE',
            storeId: store.id,
            categoryId: cat?.id,
            brandId: brand?.id,
            isFeatured: Math.random() > 0.7,
            images: {
              create: {
                url: p.image,
                alt: p.name,
                sortOrder: 0,
              },
            },
          },
        });
        totalProducts++;
      }
    }
    console.log(`Created ${totalProducts} products (10 per category, 24 with sale prices)`);

  // ==================== MENUS ====================
  // Header Category Menu
  const headerMenu = await prisma.menu.create({
    data: {
      name: 'Header Category Menu',
      slug: 'header-category-menu',
      description: 'Category navigation in storefront header.',
      location: 'HEADER',
      isActive: true,
      sortOrder: 1,
      storeId: store.id,
      items: {
        create: [
          { label: 'Electronics', url: '/categories/electronics', categoryId: electronics.id, pageType: 'CATEGORY', sortOrder: 1, isActive: true },
          { label: 'Clothing', url: '/categories/clothing', categoryId: clothing.id, pageType: 'CATEGORY', sortOrder: 2, isActive: true },
          { label: 'Home & Garden', url: '/categories/home-garden', categoryId: homeGarden.id, pageType: 'CATEGORY', sortOrder: 3, isActive: true },
          { label: 'Sports & Outdoors', url: '/categories/sports-outdoors', categoryId: sports.id, pageType: 'CATEGORY', sortOrder: 4, isActive: true },
          { label: 'Beauty & Health', url: '/categories/beauty-health', categoryId: beauty.id, pageType: 'CATEGORY', sortOrder: 5, isActive: true },
          { label: 'Books & Media', url: '/categories/books-media', categoryId: books.id, pageType: 'CATEGORY', sortOrder: 6, isActive: true },
          { label: 'Toys & Games', url: '/categories/toys-games', categoryId: toys.id, pageType: 'CATEGORY', sortOrder: 7, isActive: true },
          { label: 'Food & Beverages', url: '/categories/food-beverages', categoryId: food.id, pageType: 'CATEGORY', sortOrder: 8, isActive: true },
        ],
      },
    },
  });
  console.log('Created Header Category Menu with 8 items');

  // Footer Menu - Customer Service
  await prisma.menu.create({
    data: {
      name: 'Customer Service',
      slug: 'footer-customer-service',
      description: 'Customer support links in footer.',
      location: 'FOOTER',
      isActive: true,
      sortOrder: 1,
      storeId: store.id,
      items: {
        create: [
          { label: 'Contact Us', url: '/contact', pageType: 'PAGE', sortOrder: 1, isActive: true },
          { label: 'Shipping Info', url: '/shipping', pageType: 'PAGE', sortOrder: 2, isActive: true },
          { label: 'Returns & Exchanges', url: '/returns', pageType: 'PAGE', sortOrder: 3, isActive: true },
          { label: 'FAQ', url: '/faq', pageType: 'PAGE', sortOrder: 4, isActive: true },
          { label: 'Track Order', url: '/track-order', pageType: 'PAGE', sortOrder: 5, isActive: true },
        ],
      },
    },
  });

  // Footer Menu - About
  await prisma.menu.create({
    data: {
      name: 'About Us',
      slug: 'footer-about',
      description: 'Company info links in footer.',
      location: 'FOOTER',
      isActive: true,
      sortOrder: 2,
      storeId: store.id,
      items: {
        create: [
          { label: 'Our Story', url: '/about', pageType: 'PAGE', sortOrder: 1, isActive: true },
          { label: 'Careers', url: '/careers', pageType: 'PAGE', sortOrder: 2, isActive: true },
          { label: 'Press', url: '/press', pageType: 'PAGE', sortOrder: 3, isActive: true },
          { label: 'Privacy Policy', url: '/privacy', pageType: 'PAGE', sortOrder: 4, isActive: true },
          { label: 'Terms of Service', url: '/terms', pageType: 'PAGE', sortOrder: 5, isActive: true },
        ],
      },
    },
  });

  // Mobile Menu
  await prisma.menu.create({
    data: {
      name: 'Mobile Menu',
      slug: 'mobile-menu',
      description: 'Navigation for mobile app.',
      location: 'MOBILE',
      isActive: true,
      sortOrder: 1,
      storeId: store.id,
      items: {
        create: [
          { label: 'Home', url: '/', pageType: 'HOME', sortOrder: 1, isActive: true },
          { label: 'Categories', url: '/categories', pageType: 'CATEGORY', sortOrder: 2, isActive: true },
          { label: 'Electronics', url: '/categories/electronics', categoryId: electronics.id, pageType: 'CATEGORY', sortOrder: 3, isActive: true },
          { label: 'Clothing', url: '/categories/clothing', categoryId: clothing.id, pageType: 'CATEGORY', sortOrder: 4, isActive: true },
          { label: 'Deals', url: '/deals', pageType: 'PAGE', sortOrder: 5, isActive: true },
          { label: 'My Account', url: '/account', pageType: 'ACCOUNT', sortOrder: 6, isActive: true },
        ],
      },
    },
  });
  console.log('Created 3 additional menus (Footer x2, Mobile)');

  console.log('\n--- Seed Complete ---');
  console.log('  Super Admin: admin@aisaasecommerce.com / Admin123!');
  console.log('  Store Owner: owner@demo.com / Owner123!');
  console.log('  Store: Demo Store (demo-store)');
  console.log('  Categories: 18 (8 parent + 10 sub)');
  console.log('  Brands: 8');
  console.log('  Products: 80 (10 per category)');
  console.log('  Menus: 4 (Header, Footer x2, Mobile)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
