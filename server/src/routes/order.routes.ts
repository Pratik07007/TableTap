import express from "express";
import { createOrder, getAllOrders, updateOrderStatus } from "../controller/order.controller";
import { protect } from "../middleware/protect";

const orderRouter = express.Router();

orderRouter.post("/", protect("ADMIN"), createOrder);
orderRouter.get("/", protect("ADMIN"), getAllOrders);
orderRouter.patch("/:id/status", protect("ADMIN"), updateOrderStatus);

export default orderRouter;
