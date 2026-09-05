import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import { config } from '../config';
import { AppError, BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from '../utils/response';
import { AuthUser, PaginatedResponse } from '../types';
import { parsePagination } from '../utils/helpers';

export class AuthService {
  async register(data: { email: string; password: string; firstName: string; lastName: string; phone?: string; role?: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictError('Email already registered');

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const role = data.role === 'CUSTOMER' ? 'CUSTOMER' : 'STORE_OWNER';
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: role as any,
      },
    });

    if (role === 'CUSTOMER') {
      const firstStore = await prisma.store.findFirst({ where: { isActive: true }, select: { id: true } });
      if (firstStore) {
        const existingCustomer = await prisma.customer.findUnique({
          where: { email_storeId: { email: data.email, storeId: firstStore.id } },
        });
        if (!existingCustomer) {
          await prisma.customer.create({
            data: {
              email: data.email,
              firstName: data.firstName,
              lastName: data.lastName,
              phone: data.phone,
              storeId: firstStore.id,
            },
          });
        }
      }
    }

    const tokens = this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, ...tokens };
  }

  async createCustomerAccount(data: { email: string; password: string; firstName: string; lastName: string; phone?: string; storeId: string }) {
    const existing = await prisma.customer.findUnique({
      where: { email_storeId: { email: data.email, storeId: data.storeId } },
    });
    if (existing) throw new ConflictError('Email already registered');

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const customer = await prisma.customer.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        storeId: data.storeId,
      },
    });

    const { password, ...customerWithoutPassword } = customer as any;
    return customerWithoutPassword;
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) throw new UnauthorizedError('Invalid credentials');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthorizedError('Invalid credentials');

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, ...tokens };
  }

  async refreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret) as { id: string };
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      await prisma.refreshToken.delete({ where: { id: storedToken.id } });

      const tokens = this.generateTokens(storedToken.user);
      await this.saveRefreshToken(storedToken.user.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return; // Don't reveal if email exists

    const resetToken = uuidv4();
    const expires = new Date(Date.now() + 3600000); // 1 hour

    // In production, send email with reset link
    // For now, just log it
    console.log(`Password reset for ${email}: ${resetToken}`);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    // In production, validate token against stored hash
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    // Update user password
    return { message: 'Password reset successful' };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User');

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new BadRequestError('Current password is incorrect');

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async updateProfile(userId: string, data: { firstName?: string; lastName?: string; phone?: string; avatar?: string; email?: string }) {
    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) throw new NotFoundError('User');

    if (data.email && data.email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email: data.email } });
      if (emailTaken) throw new ConflictError('Email already registered');
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName ?? existing.firstName,
        lastName: data.lastName ?? existing.lastName,
        phone: data.phone !== undefined ? data.phone : existing.phone,
        avatar: data.avatar !== undefined ? data.avatar : existing.avatar,
        email: data.email ?? existing.email,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        storeId: true,
        isActive: true,
        emailVerified: true,
      },
    });

    return updated;
  }

  private generateTokens(user: { id: string; email: string; role: string; storeId?: string | null }) {
    const payload: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      storeId: user.storeId,
    };

    const accessToken = jwt.sign(payload, config.jwt.secret as jwt.Secret, {
      expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
    });

    const refreshToken = jwt.sign(
      { id: user.id, type: 'refresh' },
      config.jwt.refreshSecret as jwt.Secret,
      { expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'] }
    );

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, token: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: { token, userId, expiresAt },
    });
  }
}

export const authService = new AuthService();
