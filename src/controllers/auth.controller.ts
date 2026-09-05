import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import prisma from '../config/database';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

export class AuthController {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body);
    sendSuccess(res, result, 'Registration successful', 201);
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    sendSuccess(res, result, 'Login successful');
  }

  async refreshToken(req: Request, res: Response) {
    const result = await authService.refreshToken(req.body.refreshToken);
    sendSuccess(res, result, 'Token refreshed');
  }

  async logout(req: AuthRequest, res: Response) {
    await authService.logout(req.body.refreshToken);
    sendSuccess(res, null, 'Logged out');
  }

  async forgotPassword(req: Request, res: Response) {
    const result = await authService.forgotPassword(req.body.email);
    sendSuccess(res, result);
  }

  async resetPassword(req: Request, res: Response) {
    const result = await authService.resetPassword(req.body.token, req.body.password);
    sendSuccess(res, result);
  }

  async changePassword(req: AuthRequest, res: Response) {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user!.id, currentPassword, newPassword);
    sendSuccess(res, result);
  }

  async getMe(req: AuthRequest, res: Response) {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
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
    if (!user) {
      return sendSuccess(res, null, 'User not found');
    }
    sendSuccess(res, user);
  }

  async updateProfile(req: AuthRequest, res: Response) {
    const user = await authService.updateProfile(req.user!.id, req.body);
    sendSuccess(res, user, 'Profile updated');
  }
}

export const authController = new AuthController();
