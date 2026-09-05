import { Router } from 'express';
import { ExpenseController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const controller = new ExpenseController();

router.get('/', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), controller.findAll);
router.post('/', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), controller.create);
router.put('/:id', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), controller.update);
router.delete('/:id', authenticate, authorize('STORE_OWNER'), controller.delete);
router.get('/summary', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), controller.getSummary);
router.get('/profit-loss', authenticate, authorize('STORE_OWNER', 'STORE_MANAGER'), controller.getProfitLoss);

export default router;
