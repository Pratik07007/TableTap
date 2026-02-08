import { prisma } from '../../prisma/client';
import { sendInvoiceEmail } from '../utils/billingEmail';

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

export const payBillService = async (billId: string, paymentMethod: 'CASH' | 'ONLINE') => {
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
      include: { order: { include: { user: true, items: { include: { menuItem: true } } } } },
    });

    // Mark order as paid and set paidAt
    await prisma.order.update({
      where: { id: updatedBill.orderId },
      data: {
        isPaid: true,
        paidAt: new Date(),
      },
    });

    // Auto-send detailed invoice email to user after payment
    if (updatedBill.order.user?.email) {
      try {
        await sendInvoiceEmail(updatedBill.order.user.email, {
          firstName: updatedBill.order.user.firstName,
          lastName: updatedBill.order.user.lastName,
          orderId: updatedBill.orderId,
          billNumber: updatedBill.billNumber,
          createdAt: updatedBill.createdAt,
          items: updatedBill.order.items.map((i) => ({
            name: i.menuItem.name,
            unitName: i.unitName,
            quantity: i.quantity,
            price: i.price,
          })),
          totalAmount: updatedBill.totalAmount,
        });
      } catch (e) {
        console.error('Failed to send invoice email', e);
      }
    }

    return { success: true, code: 200, data: updatedBill };
  } catch (error: any) {
    console.error('Pay Bill Error:', error);
    return { success: false, code: 500, message: 'Failed to pay bill' };
  }
};

export const listBillsService = async (page: number = 1, limit: number = 10) => {
  try {
    const skip = (page - 1) * limit;
    const totalBills = await prisma.bill.count();
    const bills = await prisma.bill.findMany({
      skip,
      take: limit,
      include: {
        order: {
          include: {
            user: true,
            items: {
              include: { menuItem: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    const totalPages = Math.ceil(totalBills / limit);
    return {
      success: true,
      code: 200,
      data: bills,
      pagination: { totalBills, totalPages, currentPage: page, limit },
    };
  } catch (error: any) {
    console.error('List Bills Error:', error);
    return { success: false, code: 500, message: 'Failed to list bills' };
  }
}

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
