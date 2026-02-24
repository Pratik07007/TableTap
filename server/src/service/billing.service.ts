import { prisma } from '../../prisma/client';
import { sendInvoiceEmail } from '../utils/billingEmail';
import { randomUUID } from 'crypto';

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

export const payBillService = async (billId: string, paymentMethod: 'CASH' | 'ONLINE', amountTendered: number | undefined, processedById: string) => {
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

    if (paymentMethod === 'CASH') {
      if (typeof amountTendered !== 'number' || amountTendered < bill.totalAmount) {
        return { success: false, code: 400, message: 'Amount tendered must be greater than or equal to total amount' };
      }
    }

    const finalAmountTendered = paymentMethod === 'CASH' ? amountTendered || 0 : bill.totalAmount;
    const changeGiven = paymentMethod === 'CASH' ? Number((finalAmountTendered - bill.totalAmount).toFixed(2)) : 0;
    const paidAt = new Date();
    const transactionId = randomUUID();

    const updatedBill = await prisma.$transaction(async (tx) => {
      const updated = await tx.bill.update({
        where: { id: billId },
        data: {
          paymentStatus: 'PAID',
          paymentMethod: paymentMethod,
          amountTendered: finalAmountTendered,
          changeGiven: changeGiven,
          paidAt,
          transactionId,
          paymentProcessedById: processedById,
        },
        include: { order: { include: { user: true, items: { include: { menuItem: true } } } } },
      });

      await tx.order.update({
        where: { id: updated.orderId },
        data: {
          isPaid: true,
          paidAt: paidAt,
        },
      });

      return updated;
    });

    console.log('Payment Recorded', {
      billId: updatedBill.id,
      orderId: updatedBill.orderId,
      paymentMethod: updatedBill.paymentMethod,
      amountTendered: updatedBill.amountTendered,
      changeGiven: updatedBill.changeGiven,
      processedById,
      transactionId: updatedBill.transactionId,
      paidAt: updatedBill.paidAt,
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
          paymentMethod: updatedBill.paymentMethod || 'CASH',
          amountTendered: updatedBill.amountTendered || updatedBill.totalAmount,
          changeGiven: updatedBill.changeGiven || 0,
          paidAt: updatedBill.paidAt || new Date(),
          transactionId: updatedBill.transactionId || '',
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

export const listBillsService = async (page: number = 1, limit: number = 10, paymentMethod?: 'CASH' | 'ONLINE') => {
  try {
    const skip = (page - 1) * limit;
    const whereClause: any = {};
    if (paymentMethod) {
      whereClause.paymentMethod = paymentMethod;
    }
    const totalBills = await prisma.bill.count({ where: whereClause });
    const bills = await prisma.bill.findMany({
      skip,
      take: limit,
      where: whereClause,
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
};

export const getDailyCashSummaryService = async () => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const aggregates = await prisma.bill.aggregate({
      _sum: {
        amountTendered: true,
        changeGiven: true,
        totalAmount: true,
      },
      _count: {
        _all: true,
      },
      where: {
        paymentMethod: 'CASH',
        paymentStatus: 'PAID',
        paidAt: {
          gte: start,
          lte: end,
        },
      },
    });
    return {
      success: true,
      code: 200,
      data: {
        totalCashTendered: aggregates._sum.amountTendered || 0,
        totalChangeGiven: aggregates._sum.changeGiven || 0,
        totalCashSales: aggregates._sum.totalAmount || 0,
        transactions: aggregates._count._all || 0,
      },
    };
  } catch (error: any) {
    console.error('Daily Cash Summary Error:', error);
    return { success: false, code: 500, message: 'Failed to fetch summary' };
  }
};

type SalesGroupBy = 'day' | 'month' | 'year';

const formatBucketKey = (date: Date, groupBy: SalesGroupBy) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  if (groupBy === 'year') return `${year}`;
  if (groupBy === 'month') return `${year}-${month}`;
  return `${year}-${month}-${day}`;
};

export const getSalesSummaryService = async (from: Date, to: Date, groupBy: SalesGroupBy) => {
  try {
    const bills = await prisma.bill.findMany({
      where: {
        paymentStatus: 'PAID',
        paidAt: {
          gte: from,
          lte: to,
        },
      },
      select: {
        totalAmount: true,
        paidAt: true,
      },
      orderBy: { paidAt: 'asc' },
    });

    const buckets = new Map<string, number>();
    let total = 0;
    for (const bill of bills) {
      if (!bill.paidAt) continue;
      const key = formatBucketKey(bill.paidAt, groupBy);
      const current = buckets.get(key) ?? 0;
      const next = current + bill.totalAmount;
      buckets.set(key, next);
      total += bill.totalAmount;
    }

    const data = Array.from(buckets.entries()).map(([key, amount]) => ({
      key,
      amount,
    }));

    return {
      success: true,
      code: 200,
      data: {
        totalEarned: total,
        buckets: data,
      },
    };
  } catch (error: any) {
    console.error('Sales Summary Error:', error);
    return { success: false, code: 500, message: 'Failed to fetch sales summary' };
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
