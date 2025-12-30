import express from 'express';
import { createOrder, getAllOrders, updateOrderStatus, createCustomerOrder, getMyOrders } from '../controller/order.controller';
import { protect } from '../middleware/protect';

const orderRouter = express.Router();

//Order Creation from ADMIN side
orderRouter.post('/', protect('ADMIN'), createOrder);
orderRouter.get('/', protect('ADMIN'), getAllOrders);
orderRouter.patch('/:id/status', protect('ADMIN'), updateOrderStatus);

//Order Creation from USER side
orderRouter.post('/customer/create', protect('USER'), createCustomerOrder);
orderRouter.get('/my-orders', protect('USER'), getMyOrders);

export default orderRouter;
