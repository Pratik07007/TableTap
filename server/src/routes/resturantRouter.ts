import { Router } from "express";
import { createResturantInputValidiationMiddleware } from "../middleware/resturant.middleware";
import {
  createResturantController,
  getMyResturantController,
} from "../controller/resturant.controller";

export const resturantRouter = Router();

resturantRouter.post(
  "/create",
  createResturantInputValidiationMiddleware,
  createResturantController
);
resturantRouter.get("/me", getMyResturantController);
