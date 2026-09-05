import { Router } from 'express';
import prisma from '../../config/database';
import { sendSuccess } from '../../utils/response';

const router = Router();

// GET /api/v1/search/suggestions?q=query
router.get('/suggestions', async (req, res) => {
  const q = (req.query.q as string || '').trim();
  
  if (q.length < 2) {
    return sendSuccess(res, { products: [], categories: [] });
  }

  const searchTerm = q.toLowerCase();

  try {
    // Search products - using lowercase for case-insensitive search
    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: q } },
          { name: { contains: q.toLowerCase() } },
          { name: { contains: q.toUpperCase() } },
          { sku: { contains: q } },
          { barcode: { contains: q } },
        ],
      },
      include: {
        images: { take: 1, orderBy: { sortOrder: 'asc' } },
        brand: { select: { id: true, name: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
      take: 5,
    });

    // Search categories
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { name: { contains: q.toLowerCase() } },
          { name: { contains: q.toUpperCase() } },
          { slug: { contains: q } },
          { slug: { contains: q.toLowerCase() } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      take: 5,
    });

    const formattedProducts = products.map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      salePrice: p.salePrice,
      image: p.images?.[0]?.url || null,
      brand: p.brand,
      category: p.category,
      url: `/products/${p.slug}`,
    }));

    const formattedCategories = categories.map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      url: `/categories/${c.slug}`,
    }));

    sendSuccess(res, {
      products: formattedProducts,
      categories: formattedCategories,
    });
  } catch (error) {
    console.error('Search suggestions error:', error);
    sendSuccess(res, { products: [], categories: [] });
  }
});

export default router;
