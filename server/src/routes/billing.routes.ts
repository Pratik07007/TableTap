import { Router } from 'express';
import { validate } from '../middleware/validiate.middleware';
import { generateBillController, payBillController, getBillController, listBillsController, sendInvoiceController, dailyCashSummaryController, salesSummaryController } from '../controller/billing.controller';
import { generateBillSchema, payBillSchema } from '../types/zod';
import { protect } from '../middleware/protect';

const billingRouter = Router();

billingRouter.post('/generate', protect('ADMIN'), validate(generateBillSchema), generateBillController);
billingRouter.post('/pay', protect('ADMIN'), validate(payBillSchema), payBillController);
billingRouter.post('/send-invoice', protect('ADMIN'), sendInvoiceController);
billingRouter.get('/summary/daily-cash', protect('ADMIN'), dailyCashSummaryController);
billingRouter.get('/summary/sales', protect('ADMIN'), salesSummaryController);
billingRouter.get('/:orderId', protect(), getBillController);
billingRouter.get('/', protect('ADMIN'), listBillsController);

export default billingRouter;
