import { Router } from 'express';
import { paymentMethodController } from '../controllers/payment-method.controller';
import { authenticate, authorize } from '../middleware/auth';
import prisma from '../config/database';

const router = Router();

// Map a store's country display name to the payment-method country tag key.
const COUNTRY_KEYS: Record<string, string> = {
  'USA': 'usa',
  'United States': 'usa',
  'US': 'usa',
  'Australia': 'australia',
  'Bangladesh': 'bangladesh',
  'India': 'india',
  'Pakistan': 'pakistan',
  'Saudi Arabia': 'saudi-arabia',
};

const normalize = (s: string) => (s || '').toLowerCase().replace(/[^a-z]/g, '');

// Public endpoint - get active payment methods for a store (no auth required),
// filtered to the store's configured country (global + matching country).
router.get('/public', async (req, res) => {
  try {
    const storeId = req.query.storeId as string;

    // If no storeId provided, get the first active store
    let effectiveStoreId = storeId;
    if (!effectiveStoreId) {
      const defaultStore = await prisma.store.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      });
      if (!defaultStore) {
        return res.json({ success: true, data: [], country: 'usa', countryName: 'USA' });
      }
      effectiveStoreId = defaultStore.id;
    }

    const store = await prisma.store.findUnique({
      where: { id: effectiveStoreId },
      select: { country: true, currency: true },
    });

    const storeCountryName = (store?.country as string) || 'USA';
    const countryKey = COUNTRY_KEYS[storeCountryName] || 'usa';
    const countryKeyNorm = normalize(countryKey);

    const methods = await prisma.paymentMethod.findMany({
      where: { storeId: effectiveStoreId, enabled: true },
      orderBy: { sortOrder: 'asc' },
    });

    // Keep methods that apply globally OR match the store's configured country.
    const filtered = methods.filter((m) => {
      const mc = normalize(m.country || 'global');
      return mc === 'global' || mc === countryKeyNorm;
    });

    res.json({ success: true, data: filtered, country: countryKey, countryName: storeCountryName });
  } catch (error) {
    console.error('Error fetching public payment methods:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payment methods' });
  }
});

router.get('/', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER', 'STAFF'), paymentMethodController.findAll);
router.get('/:id', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER', 'STAFF'), paymentMethodController.findById);
router.post('/', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'), paymentMethodController.create);
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'), paymentMethodController.update);
router.patch('/:id/toggle', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'), paymentMethodController.toggle);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'), paymentMethodController.delete);

export default router;
