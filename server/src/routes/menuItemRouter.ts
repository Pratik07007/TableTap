import { Router } from "express";
import {
  createMenuItem,
  deleteMenuItem,
  getMenuItems,
  updateMenuItem,
  makeMenuItemAvailable,
} from "../controller/menuItem.controller";
import {
  validateCreateMenuItem,
  validateUpdateMenuItem,
} from "../middleware/menuItem.middleware";
import { errorHandler } from "../middleware/error.middleware";

const menuItemRouter = Router();

menuItemRouter.post("/", validateCreateMenuItem, createMenuItem);
menuItemRouter.get("/", getMenuItems);
menuItemRouter.put("/:id", validateUpdateMenuItem, updateMenuItem);
menuItemRouter.delete("/:id", deleteMenuItem);
menuItemRouter.patch("/:id/available", makeMenuItemAvailable);
menuItemRouter.use(errorHandler);
       
export default menuItemRouter;
