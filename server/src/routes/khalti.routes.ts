import express from 'express';
import { initiateKhaltiPayment, verifyKhaltiPayment } from '../controller/khalti.controller';
import { protect } from '../middleware/protect';

const khaltiRouter = express.Router();

// Users can initiate and verify their own payments
khaltiRouter.post('/initiate', protect(), initiateKhaltiPayment);
khaltiRouter.post('/verify', protect(), verifyKhaltiPayment);

export default khaltiRouter;
