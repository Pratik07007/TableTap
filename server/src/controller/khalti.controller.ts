import axios from 'axios';
import { Request, Response } from 'express';
import { prisma } from '../../prisma/client';
import { sendInvoiceEmail } from '../utils/billingEmail';

const KHALTI_API = 'https://a.khalti.com/api/v2/epayment';
const SECRET_KEY = process.env.KHALTI_SECRET_KEY || 'live_secret_key_68791341fdd94846a146f0457ff7b455';

export const initiateKhaltiPayment = async (req: Request, res: Response) => {
  try {
    const { billId, paymentMethod, cashAmount, khaltiAmount, amountTendered } = req.body;

    const bill = await prisma.bill.findUnique({
      where: { id: billId },
      include: { order: { include: { user: true } } },
    });

    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    if (bill.paymentStatus === 'PAID') return res.status(400).json({ success: false, message: 'Bill already paid' });

    let actualCashAmount = 0;
    let actualKhaltiAmount = 0;
    let finalAmountTendered = 0;
    let changeGiven = 0;

    if (paymentMethod === 'KHALTI') {
      actualKhaltiAmount = bill.totalAmount;
    } else if (paymentMethod === 'SPLIT') {
      const cAmt = typeof cashAmount === 'number' ? cashAmount : 0;
      const kAmt = typeof khaltiAmount === 'number' ? khaltiAmount : 0;
      if (Math.abs(cAmt + kAmt - bill.totalAmount) > 0.01) {
        return res.status(400).json({ success: false, message: 'Split amounts must sum exactly to total bill' });
      }
      if (typeof amountTendered !== 'number' || amountTendered < cAmt) {
        return res.status(400).json({ success: false, message: 'Amount tendered must be >= cash portion' });
      }
      actualCashAmount = cAmt;
      actualKhaltiAmount = kAmt;
      finalAmountTendered = amountTendered;
      changeGiven = Number((amountTendered - cAmt).toFixed(2));
    } else {
      return res.status(400).json({ success: false, message: 'Invalid payment method for Khalti initiate' });
    }

    // Call Khalti initiate
    const WEBSITE_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
    const khaltiPayload = {
      return_url: `${WEBSITE_URL}/payment/${bill.orderId}?khalti=callback`,
      website_url: WEBSITE_URL,
      amount: Math.round(actualKhaltiAmount * 100), // Khalti expects paisa (amount * 100)
      purchase_order_id: bill.id,
      purchase_order_name: `Bill #${bill.billNumber}`,
      customer_info: {
        name: bill.order.user ? `${bill.order.user.firstName} ${bill.order.user.lastName}` : 'Guest User',
        email: bill.order.user?.email || 'guest@example.com',
        phone: '9800000000'
      }
    };

    const khaltiRes = await axios.post(`${KHALTI_API}/initiate/`, khaltiPayload, {
      headers: {
        'Authorization': `Key ${SECRET_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    const { pidx, payment_url } = khaltiRes.data;

    // Save intended amounts and pidx temporarily (while PENDING)
    await prisma.bill.update({
      where: { id: bill.id },
      data: {
        paymentMethod: paymentMethod as any,
        cashAmount: actualCashAmount > 0 ? actualCashAmount : null,
        khaltiAmount: actualKhaltiAmount > 0 ? actualKhaltiAmount : null,
        amountTendered: finalAmountTendered > 0 ? finalAmountTendered : null,
        changeGiven: changeGiven > 0 ? changeGiven : null,
        transactionId: pidx, // Store pidx here to correlate during callback
      }
    });

    return res.status(200).json({ success: true, payment_url, pidx });

  } catch (err: any) {
    console.error('Khalti initiate error:', err.response?.data || err.message);
    return res.status(500).json({ success: false, message: 'Failed to initiate Khalti payment' });
  }
};

export const verifyKhaltiPayment = async (req: Request, res: Response) => {
  try {
    const { pidx } = req.body;
    if (!pidx) return res.status(400).json({ success: false, message: 'pidx is required' });

    // Look up Khalti
    const khaltiRes = await axios.post(`${KHALTI_API}/lookup/`, { pidx }, {
      headers: {
        'Authorization': `Key ${SECRET_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    if (khaltiRes.data.status !== 'Completed') {
      return res.status(400).json({ success: false, message: 'Khalti payment is not completed', data: khaltiRes.data });
    }

    // Find the bill
    const bill = await prisma.bill.findFirst({
      where: { transactionId: pidx },
      include: { order: { include: { user: true, items: { include: { menuItem: { include: { images: true } } } } } } },
    });

    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    if (bill.paymentStatus === 'PAID') return res.status(200).json({ success: true, message: 'Bill already paid' });

    const processedById = (req as any).user?.id || '';
    const paidAt = new Date();

    const updatedBill = await prisma.$transaction(async (tx) => {
      const updated = await tx.bill.update({
        where: { id: bill.id },
        data: {
          paymentStatus: 'PAID',
          paidAt: paidAt,
          paymentProcessedById: processedById,
          // transactionId remains as `pidx` which acts as the official transaction ID
        },
        include: { order: { include: { user: true, restaurant: true, items: { include: { menuItem: { include: { images: true } } } } } } },
      });

      await tx.order.update({
        where: { id: bill.orderId },
        data: { isPaid: true, paidAt },
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
          paymentMethod: updatedBill.paymentMethod || 'KHALTI',
          amountTendered: updatedBill.amountTendered || updatedBill.totalAmount,
          changeGiven: updatedBill.changeGiven || 0,
          paidAt: updatedBill.paidAt || new Date(),
          transactionId: updatedBill.transactionId || '',
        });
      } catch (e) {
        console.error('Failed to send invoice email', e);
      }
    }

    return res.status(200).json({ success: true, message: 'Payment verified and bill paid successfully' });

  } catch (err: any) {
    console.error('Khalti verify error:', err.response?.data || err.message);
    return res.status(500).json({ success: false, message: 'Failed to verify Khalti payment' });
  }
};
