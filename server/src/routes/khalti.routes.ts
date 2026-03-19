import express from 'express';
import { initiateKhaltiPayment, verifyKhaltiPayment } from '../controller/khalti.controller';
import { protect } from '../middleware/protect';

const khaltiRouter = express.Router();

// Both require admin protected auth, assuming bill payment is initiated by admin
khaltiRouter.post('/initiate', protect('ADMIN'), initiateKhaltiPayment);
khaltiRouter.post('/verify', protect('ADMIN'), verifyKhaltiPayment);

export default khaltiRouter;
