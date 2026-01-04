import { prisma } from '../../prisma/client';
import { sendBillPaymentEmail } from '../utils/billingEmail';

export const generateBillService = async (orderId: string) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { bill: true },
    });

    if (!order) {
      return { success: false, code: 404, message: 'Order not found' };
    }

    if (order.status !== 'COMPLETED') {
      return { success: false, code: 400, message: 'Order must be COMPLETED (Served) before generating bill' };
    }

    if (order.bill) {
      return { success: false, code: 400, message: 'Bill already generated for this order' };
    }

    const bill = await prisma.bill.create({
      data: {
        orderId: orderId,
        totalAmount: order.finalAmount,
        paymentStatus: 'PENDING',
      },
    });

    return { success: true, code: 201, data: bill };
  } catch (error: any) {
    console.error('Generate Bill Error:', error);
    return { success: false, code: 500, message: 'Failed to generate bill' };
  }
};

export const payBillService = async (billId: string, paymentMethod: 'CASH' | 'CARD' | 'ONLINE') => {
  try {
    const bill = await prisma.bill.findUnique({
      where: { id: billId },
      include: { order: { include: { user: true } } },
    });

    if (!bill) {
      return { success: false, code: 404, message: 'Bill not found' };
    }

    if (bill.paymentStatus === 'PAID') {
      return { success: false, code: 400, message: 'Bill already paid' };
    }

    const updatedBill = await prisma.bill.update({
      where: { id: billId },
      data: {
        paymentStatus: 'PAID',
        paymentMethod: paymentMethod,
      },
      include: { order: { include: { user: true } } },
    });

    if (updatedBill.order.user && updatedBill.order.user.email) {
      try {
        await sendBillPaymentEmail(updatedBill.order.user.email, { firstName: updatedBill.order.user.firstName, lastName: updatedBill.order.user.lastName }, updatedBill.orderId, updatedBill.totalAmount, new Date());
      } catch (e) {
        console.error('Failed to send billing email', e);
      }
    }

    return { success: true, code: 200, data: updatedBill };
  } catch (error: any) {
    console.error('Pay Bill Error:', error);
    return { success: false, code: 500, message: 'Failed to pay bill' };
  }
};

export const getBillService = async (orderId: string) => {
  try {
    const bill = await prisma.bill.findUnique({
      where: { orderId: orderId },
      include: {
        order: {
          include: {
            items: {
              include: {
                menuItem: true,
              },
            },
            user: true,
          },
        },
      },
    });

    if (!bill) {
      return { success: false, code: 404, message: 'Bill not found for this order' };
    }

    return { success: true, code: 200, data: bill };
  } catch (error: any) {
    console.error('Get Bill Error:', error);
    return { success: false, code: 500, message: 'Failed to fetch bill' };
  }
};
