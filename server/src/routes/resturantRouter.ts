import { Router } from "express";
import {
  createResturantInputValidiationMiddleware,
  updateResturantInputValidationMiddleware,
} from "../middleware/resturant.middleware";
import {
  createResturantController,
  getMyResturantController,
  updateMyResturantController,
} from "../controller/resturant.controller";

export const resturantRouter = Router();

resturantRouter.post(
  "/create",
  createResturantInputValidiationMiddleware,
  createResturantController
);

resturantRouter.get("/me", getMyResturantController);

resturantRouter.put(
  "/update",
  updateResturantInputValidationMiddleware,
  updateMyResturantController
);
