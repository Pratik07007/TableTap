import { Request, Response } from 'express';
import { generateBillService, payBillService, getBillService } from '../service/billing.service';

export const generateBillController = async (req: Request, res: Response) => {
  const { orderId } = req.body;
  const response = await generateBillService(orderId);
  return res.status(response.code).json({ ...response });
};

export const payBillController = async (req: Request, res: Response) => {
  const { billId, paymentMethod } = req.body;
  const response = await payBillService(billId, paymentMethod);
  return res.status(response.code).json({ ...response });
};

export const getBillController = async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const response = await getBillService(orderId);
  return res.status(response.code).json({ ...response });
};
