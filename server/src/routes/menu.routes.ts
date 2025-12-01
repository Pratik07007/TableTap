import { Router } from "express";
import {
  createMenuItem,
  deleteMenuItem,
  getMenuItems,
  // getMenuItems,
  // updateMenuItem,
  makeMenuItemAvailable,
  updateMenuItem,
} from "../controller/menuItem.controller";

import { validate } from "../middleware/validiate.middleware";
import { menuItemSchema } from "../types/zod";
import { protect } from "../middleware/protect";

const menuItemRouter = Router();

menuItemRouter.post(
  "/",
  validate(menuItemSchema),
  protect("admin"),
  createMenuItem
);
menuItemRouter.get("/", protect("admin"), getMenuItems);
menuItemRouter.put("/:id", protect("admin"), updateMenuItem);
menuItemRouter.delete("/:id", protect("admin"), deleteMenuItem);
menuItemRouter.patch("/:id/available", protect("admin"), makeMenuItemAvailable);

export default menuItemRouter;
