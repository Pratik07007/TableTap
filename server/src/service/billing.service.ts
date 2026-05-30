import { randomUUID } from 'crypto';
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

export const payBillService = async (
  billId: string,
  paymentMethod: string, // CASH, KHALTI, SPLIT
  cashAmount: number | undefined,
  khaltiAmount: number | undefined,
  amountTendered: number | undefined,
  processedById: string,
  transactionIdParam?: string // for khalti Pidx
) => {
  try {
    const bill = await prisma.bill.findUnique({
      where: { id: billId },
      include: { order: { include: { user: true } } },
    });

    if (!bill) return { success: false, code: 404, message: 'Bill not found' };
    if (bill.paymentStatus === 'PAID') return { success: false, code: 400, message: 'Bill already paid' };

    let finalAmountTendered = 0;
    let changeGiven = 0;
    let actualCashAmount = 0;
    let actualKhaltiAmount = 0;

    if (paymentMethod === 'CASH') {
      if (typeof amountTendered !== 'number' || amountTendered < bill.totalAmount) {
        return { success: false, code: 400, message: 'Amount tendered must be >= total amount' };
      }
      finalAmountTendered = amountTendered;
      changeGiven = Number((amountTendered - bill.totalAmount).toFixed(2));
      actualCashAmount = bill.totalAmount;
    } else if (paymentMethod === 'KHALTI') {
      actualKhaltiAmount = bill.totalAmount;
    } else if (paymentMethod === 'SPLIT') {
      const cAmt = typeof cashAmount === 'number' ? cashAmount : 0;
      const kAmt = typeof khaltiAmount === 'number' ? khaltiAmount : 0;
      if (Math.abs(cAmt + kAmt - bill.totalAmount) > 0.01) {
        return { success: false, code: 400, message: 'Split amounts must sum exactly to total bill amount' };
      }
      if (typeof amountTendered !== 'number' || amountTendered < cAmt) {
        return { success: false, code: 400, message: 'Amount tendered must be >= cash portion' };
      }
      actualCashAmount = cAmt;
      actualKhaltiAmount = kAmt;
      finalAmountTendered = amountTendered;
      changeGiven = Number((amountTendered - cAmt).toFixed(2));
    } else {
      return { success: false, code: 400, message: 'Invalid payment method' };
    }

    const paidAt = new Date();
    const transactionId = transactionIdParam || randomUUID();

    const updatedBill = await prisma.$transaction(async (tx) => {
      const updated = await tx.bill.update({
        where: { id: billId },
        data: {
          paymentStatus: 'PAID',
          paymentMethod: paymentMethod as any,
          cashAmount: actualCashAmount > 0 ? actualCashAmount : null,
          khaltiAmount: actualKhaltiAmount > 0 ? actualKhaltiAmount : null,
          amountTendered: finalAmountTendered > 0 ? finalAmountTendered : null,
          changeGiven: changeGiven > 0 ? changeGiven : null,
          paidAt,
          transactionId,
          paymentProcessedById: processedById,
        },
        include: { order: { include: { user: true, restaurant: true, items: { include: { menuItem: { include: { images: true } } } } } } },
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

    // Auto-send detailed invoice email to user after payment
    if (updatedBill.order.user?.email) {
      try {
        await sendInvoiceEmail(updatedBill.order.user.email, {
          firstName: updatedBill.order.user.firstName,
          lastName: updatedBill.order.user.lastName,
          restaurantName: updatedBill.order.restaurant?.name,
          restaurantAddress: updatedBill.order.restaurant ? `${updatedBill.order.restaurant.streetAddress}, ${updatedBill.order.restaurant.city}, ${updatedBill.order.restaurant.state} ${updatedBill.order.restaurant.zip}` : undefined,
          restaurantPhone: updatedBill.order.restaurant?.phone,
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

export const listBillsService = async (page: number = 1, limit: number = 10, paymentMethod?: string, email?: string, paymentStatus?: string, dateFrom?: string, dateTo?: string) => {
  try {
    const skip = (page - 1) * limit;
    const whereClause: any = {};
    if (paymentMethod) {
      whereClause.paymentMethod = paymentMethod as any;
    }
    if (paymentStatus) {
      whereClause.paymentStatus = paymentStatus as any;
    }
    if (email) {
      whereClause.order = {
        user: {
          email: { contains: email, mode: 'insensitive' }
        }
      };
    }
    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) {
        whereClause.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        whereClause.createdAt.lte = new Date(dateTo);
      }
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
              include: { menuItem: { include: { images: true } } },
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
                menuItem: { include: { images: true } },
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
