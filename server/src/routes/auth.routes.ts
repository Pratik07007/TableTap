import { Router } from 'express';
import { validate } from '../middleware/validiate.middleware';

import { loginController, registerUserController, verifyEmailController, forgotPasswordController, resetPasswordController, logoutController, resendVerificationEmailController } from '../controller/auth.controller';

import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema, verifyEmailSchema } from '../types/zod';

const authRouter = Router();

authRouter.post('/register', validate(registerSchema), registerUserController);

authRouter.post('/verify-email', validate(verifyEmailSchema), verifyEmailController);

authRouter.post('/resend-verification-email', validate(forgotPasswordSchema), resendVerificationEmailController);

authRouter.post('/login', validate(loginSchema), loginController);

authRouter.post('/forgot-password', validate(forgotPasswordSchema), forgotPasswordController);

authRouter.post('/reset-password', validate(resetPasswordSchema), resetPasswordController);

authRouter.post('/logout', logoutController);

export default authRouter;
