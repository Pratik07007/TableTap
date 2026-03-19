import { Request, Response } from 'express';
import { generateBillService, payBillService, getBillService, listBillsService, getDailyCashSummaryService, getSalesSummaryService } from '../service/billing.service';
import { prisma } from '../../prisma/client';
import { sendInvoiceEmail } from '../utils/billingEmail';

export const generateBillController = async (req: Request, res: Response) => {
  const { orderId } = req.body;
  const response = await generateBillService(orderId);
  return res.status(response.code).json({ ...response });
};

export const payBillController = async (req: Request, res: Response) => {
  const { billId, paymentMethod, amountTendered, cashAmount, khaltiAmount } = req.body;
  const processedById = (req as any).user?.id || '';
  const response = await payBillService(billId, paymentMethod, cashAmount, khaltiAmount, amountTendered, processedById);
  return res.status(response.code).json({ ...response });
};

export const getBillController = async (req: Request, res: Response) => {
  const orderId = String(req.params.orderId);
  const response = await getBillService(orderId);
  return res.status(response.code).json({ ...response });
};

export const listBillsController = async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const paymentMethod = req.query.paymentMethod as string | undefined;
  const email = req.query.email as string | undefined;
  const paymentStatus = req.query.paymentStatus as string | undefined;
  
  const response = await listBillsService(page, limit, paymentMethod, email, paymentStatus);
  return res.status(response.code).json({ ...response });
};

export const sendInvoiceController = async (req: Request, res: Response) => {
  try {
    const { billId } = req.body;
    const bill = await prisma.bill.findUnique({
      where: { id: billId },
      include: {
        order: {
          include: {
            items: { include: { menuItem: true } },
            user: true,
          },
        },
      },
    });
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }
    if (bill.paymentStatus !== 'PAID') {
      return res.status(400).json({ success: false, message: 'Invoice can be sent only after payment' });
    }
    if (!bill.order.user?.email) {
      return res.status(400).json({ success: false, message: 'Customer email not available' });
    }
    await sendInvoiceEmail(bill.order.user.email, {
      firstName: bill.order.user?.firstName,
      lastName: bill.order.user?.lastName,
      orderId: bill.orderId,
      billNumber: bill.billNumber,
      createdAt: bill.createdAt,
      items: bill.order.items.map((i) => ({
        name: i.menuItem.name,
        unitName: i.unitName,
        quantity: i.quantity,
        price: i.price,
      })),
      totalAmount: bill.totalAmount,
      paymentMethod: bill.paymentMethod || 'CASH',
      amountTendered: bill.amountTendered || bill.totalAmount,
      changeGiven: bill.changeGiven || 0,
      paidAt: bill.paidAt || bill.updatedAt,
      transactionId: bill.transactionId || '',
    });
    return res.status(200).json({ success: true, message: 'Invoice email sent' });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to send invoice email' });
  }
};

export const dailyCashSummaryController = async (_req: Request, res: Response) => {
  const response = await getDailyCashSummaryService();
  return res.status(response.code).json({ ...response });
};

export const salesSummaryController = async (req: Request, res: Response) => {
  const fromParam = String(req.query.from || '');
  const toParam = String(req.query.to || '');
  const groupBy = (req.query.groupBy as 'day' | 'month' | 'year') || 'day';
  const from = new Date(fromParam);
  const to = new Date(toParam);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return res.status(400).json({ success: false, message: 'Invalid date range' });
  }
  const response = await getSalesSummaryService(from, to, groupBy);
  return res.status(response.code).json({ ...response });
};
