import { Router } from "express";
import {
  registerMiddleware,
  loginMiddleware,
  forgotPasswordMiddleware,
  resetPasswordMiddleware,
} from "../middleware/auth.middleware";
import {
  loginController,
  registerUserController,
  verifyEmailController,
  forgotPasswordController,
  resetPasswordController,
  validateSessionController,
  logoutController,
  registerRestaurantController,
  authDocsController,
} from "../controller/auth.controller";
const authRouter = Router();

authRouter.post("/register", registerMiddleware, registerUserController);

authRouter.post("/login", loginMiddleware, loginController);

authRouter.post("/verify-email", verifyEmailController);

authRouter.post(
  "/forgot-password",
  forgotPasswordMiddleware,
  forgotPasswordController
);

authRouter.post(
  "/reset-password",
  resetPasswordMiddleware,
  resetPasswordController
);

authRouter.get("/validate-session", validateSessionController);
authRouter.post("/logout", logoutController);
authRouter.post("/register-restaurant", registerRestaurantController);
authRouter.get("/docs", authDocsController);

export default authRouter;
