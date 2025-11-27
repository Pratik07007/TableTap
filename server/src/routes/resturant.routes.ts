import { Router } from "express";

import {
  createResturantController,
  getMyResturantController,
  updateMyResturantController,
} from "../controller/resturant.controller";
import { resturantSchema } from "../types/zod";
import { validate } from "../middleware/validiate.middleware";

export const resturantRouter = Router();

resturantRouter.post(
  "/create",
  validate(resturantSchema),
  createResturantController
);

resturantRouter.get("/me", getMyResturantController);

resturantRouter.put(
  "/update",
  validate(resturantSchema),
  updateMyResturantController
);
