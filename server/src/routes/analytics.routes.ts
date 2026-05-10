import express from 'express';
import { protect } from '../middleware/protect';
import { getAnalyticsController } from '../controller/analytics.controller';

const analyticsRouter = express.Router();

analyticsRouter.get('/', protect('ADMIN'), getAnalyticsController);

export default analyticsRouter;
