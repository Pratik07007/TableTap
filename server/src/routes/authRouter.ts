import { Router } from "express";
import {
  registerMiddleware,
  loginMiddleware,
} from "../middleware/authMiddleware";
const authRouter = Router();

authRouter.post("/register", registerMiddleware);

authRouter.post("/login", loginMiddleware);

export default authRouter;
