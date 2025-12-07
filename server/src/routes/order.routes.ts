import express from "express";
import { createOrder } from "../controller/order.controller";
import { protect } from "../middleware/protect";

const orderRouter = express.Router();

orderRouter.post("/", protect("ADMIN"), createOrder);

export default orderRouter;
