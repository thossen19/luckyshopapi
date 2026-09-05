import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import prisma from '../config/database';
import { AuthRequest } from '../types';

const router = Router();

// Get users by store
router.get('/', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER', 'STORE_MANAGER'), async (req: AuthRequest, res) => {
  try {
    const { storeId, page = '1', limit = '20', role, search } = req.query;
    
    // SUPER_ADMIN can query any store, others use their own
    const effectiveStoreId = req.user?.role === 'SUPER_ADMIN' 
      ? (storeId as string) || undefined 
      : req.user?.storeId;

    const where: any = {};
    if (effectiveStoreId) where.storeId = effectiveStoreId;
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
      ];
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          emailVerified: true,
          lastLoginAt: true,
          createdAt: true,
          storeId: true,
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        data: users,
        meta: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// Create user (staff member)
router.post('/', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER'), async (req: AuthRequest, res) => {
  try {
    const { email, password, firstName, lastName, phone, role, storeId } = req.body;
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: role || 'STAFF',
        storeId: req.user?.role === 'SUPER_ADMIN' ? storeId : req.user?.storeId,
        isActive: true,
        emailVerified: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        storeId: true,
      },
    });

    res.status(201).json({ success: true, data: user, message: 'User created' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER'), async (req, res) => {
  try {
    const { firstName, lastName, phone, role, isActive } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { firstName, lastName, phone, role, isActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        storeId: true,
      },
    });

    res.json({ success: true, data: user, message: 'User updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
});

// Delete user
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'STORE_OWNER'), async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

export default router;
