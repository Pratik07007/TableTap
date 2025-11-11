import { Router } from "express";
import {
  registerMiddleware,
  loginMiddleware,
} from "../middleware/auth.middleware";
import {
  loginController,
  registerUserController,
  verifyEmailController,
} from "../controller/auth.controller.ts";
const authRouter = Router();

authRouter.post("/register", registerMiddleware, registerUserController);

authRouter.post("/login", loginMiddleware, loginController);

authRouter.post("/verify-email", verifyEmailController);

export default authRouter;
