import { Router } from 'express';
import { validate } from '../middleware/validiate.middleware';
import { generateBillController, payBillController, getBillController } from '../controller/billing.controller';
import { generateBillSchema, payBillSchema } from '../types/zod';

const billingRouter = Router();

billingRouter.post('/generate', validate(generateBillSchema), generateBillController);
billingRouter.post('/pay', validate(payBillSchema), payBillController);
billingRouter.get('/:orderId', getBillController);

export default billingRouter;
