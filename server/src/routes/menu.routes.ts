import { Router } from "express";
import {
  createMenuItem,
  deleteMenuItem,
  getMenuItems,
  updateMenuItem,
  makeMenuItemAvailable,
} from "../controller/menuItem.controller";

import { validate } from "../middleware/validiate.middleware";
import { menuItemSchema } from "../types/zod";

const menuItemRouter = Router();

menuItemRouter.post("/", validate(menuItemSchema), createMenuItem);
menuItemRouter.get("/", getMenuItems);
menuItemRouter.put("/:id", updateMenuItem);
menuItemRouter.delete("/:id", deleteMenuItem);
menuItemRouter.patch("/:id/available", makeMenuItemAvailable);

export default menuItemRouter;
