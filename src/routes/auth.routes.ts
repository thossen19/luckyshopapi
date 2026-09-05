import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, refreshTokenSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.validator';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.post('/change-password', authenticate, authController.changePassword);
router.get('/me', authenticate, authController.getMe);
router.put('/me', authenticate, authController.updateProfile);

export default router;
