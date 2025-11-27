import { Router } from "express";

import {
  loginController,
  registerUserController,
  verifyEmailController,
  forgotPasswordController,
  resetPasswordController,
  validateSessionController,
  logoutController,
  registerRestaurantController,
} from "../controller/auth.controller";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../types/zod";
import { validate } from "../middleware/validiate.middleware";
const authRouter = Router();

authRouter.post("/register", validate(registerSchema), registerUserController);

authRouter.post("/login", validate(loginSchema), loginController);

authRouter.post(
  "/verify-email",
  validate(verifyEmailSchema),
  verifyEmailController
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

authRouter.get("/validate-session", validateSessionController);
authRouter.post("/logout", logoutController);
authRouter.post("/register-restaurant", registerRestaurantController);

export default authRouter;
