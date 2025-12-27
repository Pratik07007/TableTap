import express from 'express';
import { createOrder, getAllOrders, updateOrderStatus, createCustomerOrder, getMyOrders } from '../controller/order.controller';
import { protect } from '../middleware/protect';

const orderRouter = express.Router();

// Admin routes
orderRouter.post('/', protect('ADMIN'), createOrder);
orderRouter.get('/', protect('ADMIN'), getAllOrders);
orderRouter.patch('/:id/status', protect('ADMIN'), updateOrderStatus);

// Customer routes
orderRouter.post('/customer/create', protect(), createCustomerOrder);
orderRouter.get('/my-orders', protect(), getMyOrders);

export default orderRouter;
