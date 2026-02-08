import { Request, Response } from 'express';
import { generateBillService, payBillService, getBillService, listBillsService } from '../service/billing.service';
import { prisma } from '../../prisma/client';
import { sendInvoiceEmail } from '../utils/billingEmail';

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

export const listBillsController = async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const response = await listBillsService(page, limit);
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
    await sendInvoiceEmail(bill.order.user?.email ?? '', {
      firstName: bill.order.user?.firstName,
      lastName: bill.order.user?.lastName,
      orderId: bill.orderId,
      billNumber: bill.billNumber,
      createdAt: bill.createdAt,
      items: bill.order.items.map(i => ({
        name: i.menuItem.name,
        unitName: i.unitName,
        quantity: i.quantity,
        price: i.price,
      })),
      totalAmount: bill.totalAmount,
    });
    return res.status(200).json({ success: true, message: 'Invoice email sent' });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to send invoice email' });
  }
};
