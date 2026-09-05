import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.get('/', authenticate, async (req, res) => { res.json({ success: true, data: [] }); });
router.post('/create-intent', authenticate, async (req, res) => { res.json({ success: true, data: { clientSecret: 'demo' } }); });
router.post('/confirm', authenticate, async (req, res) => { res.json({ success: true }); });
export default router;
