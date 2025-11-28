import { Router } from "express";
import { validate } from "../middleware/validiate.middleware";

import {
  loginController,
  registerUserController,
  verifyEmailController,
  forgotPasswordController,
  resetPasswordController,
  getSessionInfoController,
  logoutController,
  resendVerificationEmailController,
} from "../controller/auth.controller";

import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../types/zod";

const authRouter = Router();

authRouter.post("/register", validate(registerSchema), registerUserController);

authRouter.post(
  "/verify-email",
  validate(verifyEmailSchema),
  verifyEmailController
);

authRouter.post("/login", validate(loginSchema), loginController);

authRouter.post(
  "/resend-verification-email",
  validate(forgotPasswordSchema),
  resendVerificationEmailController
);

authRouter.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  forgotPasswordController
);

authRouter.post(
  "/reset-password",
  validate(resetPasswordSchema),
  resetPasswordController
);

authRouter.get("/get-session-info", getSessionInfoController);
authRouter.post("/logout", logoutController);

export default authRouter;
