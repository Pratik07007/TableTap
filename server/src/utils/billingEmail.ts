import PDFDocument from 'pdfkit';
import { sendWithRetry } from './emailRetry';
import { transporter } from './mail.config';

export const sendBillPaymentEmail = async (email: string, userParams: { firstName: string; lastName: string }, orderId: string, amount: number, date: Date) => {
    const info = await sendWithRetry(() =>
        transporter.sendMail({
            from: `"TableTap" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Payment Receipt - TableTap',
            html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 28px;">Payment Successful!</h1>
          <p style="color: #f0f0f0; margin: 10px 0 0; font-size: 16px;">Thank you for dining with us.</p>
        </div>
        <div style="background: #fff; padding: 40px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <p style="font-size: 16px; line-height: 1.5; margin: 0 0 24px;">Hi ${userParams.firstName},</p>
          <p style="font-size: 16px; line-height: 1.5; margin: 0 0 24px;">
            We have received your payment for Order #${orderId.slice(0, 8)}.
          </p>

          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Amount Paid:</span>
              <span style="font-weight: 600;">$${amount.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Date:</span>
              <span>${new Date(date).toLocaleDateString()}</span>
            </div>
             <div style="display: flex; justify-content: space-between;">
              <span style="color: #666;">Status:</span>
              <span style="color: #10b981; font-weight: 600;">PAID</span>
            </div>
          </div>

          <p style="font-size: 14px; color: #666; margin: 0 0 8px;">We hope to see you again soon!</p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
          <p style="font-size: 14px; color: #999; margin: 0;">
            TableTap
          </p>
        </div>
      </div>
    `,
        })
    );

    console.log('Billing Email sent:', info.messageId);
};

const buildInvoicePdf = async (params: { restaurantName?: string; restaurantPhone?: string; restaurantAddress?: string; orderId: string; billNumber: number; createdAt: Date; items: Array<{ name: string; unitName: string; quantity: number; price: number }>; totalAmount: number; paymentMethod: string; amountTendered: number; changeGiven: number; paidAt: Date; transactionId: string }) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (d: Buffer) => chunks.push(d));
    const done = new Promise<Buffer>((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
    });

    // Header - Restaurant Name
    doc.fontSize(24).font('Helvetica-Bold').text(params.restaurantName || 'TableTap', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text('INVOICE', { align: 'center' });

    // Restaurant Details
    if (params.restaurantAddress) {
        doc.fontSize(9).text(params.restaurantAddress, { align: 'center' });
    }
    if (params.restaurantPhone) {
        doc.fontSize(9).text(`Phone: ${params.restaurantPhone}`, { align: 'center' });
    }

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.8);

    // Invoice Details Section
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text(`Bill #: ${String(params.billNumber).padStart(6, '0')}`, { width: 250 });
    doc.fontSize(9).font('Helvetica');
    doc.text(`Order ID: ${params.orderId}`, { width: 250 });
    doc.text(`Date: ${new Date(params.createdAt).toLocaleDateString()} ${new Date(params.createdAt).toLocaleTimeString()}`, { width: 250 });

    doc.moveDown(0.5);

    // Table Header
    const startX = 50;
    const col1 = startX;
    const col2 = startX + 280;
    const col3 = startX + 370;
    const col4 = startX + 460;

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Item', col1, doc.y, { width: 280 });
    doc.text('Qty', col2, doc.y - 15, { width: 80, align: 'center' });
    doc.text('Price', col3, doc.y - 15, { width: 80, align: 'right' });
    doc.text('Amount', col4, doc.y - 15, { width: 80, align: 'right' });

    doc.moveTo(startX, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.3);

    // Table Items
    doc.fontSize(9).font('Helvetica');
    params.items.forEach((item, index) => {
        const lineTotal = item.price * item.quantity;
        const itemText = `${item.name} (${item.unitName})`;

        doc.text(itemText, col1, doc.y, { width: 280 });
        const currentY = doc.y;

        doc.text(item.quantity.toString(), col2, currentY, { width: 80, align: 'center' });
        doc.text(`$${item.price.toFixed(2)}`, col3, currentY, { width: 80, align: 'right' });
        doc.text(`$${lineTotal.toFixed(2)}`, col4, currentY, { width: 80, align: 'right' });

        doc.moveDown(0.5);

        if (index < params.items.length - 1) {
            doc.moveTo(startX, doc.y).lineTo(550, doc.y).stroke('gray');
            doc.moveDown(0.2);
        }
    });

    doc.moveDown(0.3);
    doc.moveTo(startX, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Totals Section
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Total Amount:', 350, doc.y, { width: 100 });
    doc.text(`$${params.totalAmount.toFixed(2)}`, 450, doc.y - 10, { width: 100, align: 'right' });

    doc.moveDown(1);

    // Payment Details
    doc.fontSize(9).font('Helvetica');
    doc.text(`Payment Method: ${params.paymentMethod}`);
    doc.text(`Amount Tendered: $${params.amountTendered.toFixed(2)}`);
    doc.text(`Change Given: $${params.changeGiven.toFixed(2)}`);
    doc.text(`Paid At: ${new Date(params.paidAt).toLocaleDateString()} ${new Date(params.paidAt).toLocaleTimeString()}`);
    doc.text(`Transaction ID: ${params.transactionId}`);

    doc.moveDown(1);
    doc.moveTo(startX, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Footer
    doc.fontSize(10).font('Helvetica-Bold').text('Thank You for Your Business!', { align: 'center' });
    doc.fontSize(8).font('Helvetica').text('Payment Received - This is a receipt for your records', { align: 'center' });
    doc.fontSize(8).text('We appreciate your patronage and look forward to serving you again!', { align: 'center' });

    doc.end();
    return done;
};

export const sendInvoiceEmail = async (
    email: string,
    params: {
        firstName?: string;
        lastName?: string;
        restaurantName?: string;
        restaurantPhone?: string;
        restaurantAddress?: string;
        orderId: string;
        billNumber: number;
        createdAt: Date;
        items: Array<{ name: string; unitName: string; quantity: number; price: number }>;
        totalAmount: number;
        paymentMethod: string;
        amountTendered: number;
        changeGiven: number;
        paidAt: Date;
        transactionId: string;
    }
) => {
    const rows = params.items
        .map(
            (i) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 0; color: #111;">
          <div style="font-weight: 600; color: #111; font-size: 14px;">${i.name}</div>
          <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">${i.unitName}</div>
        </td>
        <td style="padding: 12px 0; text-align: center; color: #555; font-size: 14px;">${i.quantity}</td>
        <td style="padding: 12px 0; text-align: right; color: #555; font-size: 14px;">$${i.price.toFixed(2)}</td>
        <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #111; font-size: 14px;">$${(i.price * i.quantity).toFixed(2)}</td>
      </tr>
    `
        )
        .join('');

    const html = `
    <div style="max-width: 700px; margin: 0 auto; font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1f2937; background-color: #ffffff;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
          ${params.restaurantName || 'TableTap'}
        </h1>
        <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255,255,255,0.9);">INVOICE</p>
      </div>

      <!-- Restaurant Details -->
      ${params.restaurantAddress || params.restaurantPhone ? `
      <div style="background: #f3f4f6; padding: 20px 30px; border-bottom: 1px solid #e5e7eb;">
        <div style="font-size: 13px; color: #6b7280; line-height: 1.6;">
          ${params.restaurantAddress ? `<div>${params.restaurantAddress}</div>` : ''}
          ${params.restaurantPhone ? `<div>Phone: ${params.restaurantPhone}</div>` : ''}
        </div>
      </div>
      ` : ''}

      <!-- Main Content -->
      <div style="padding: 30px; background: #ffffff;">
        <!-- Greeting -->
        <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6;">
          Hello ${params.firstName || 'Valued Customer'},
        </p>
        <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #555;">
          Thank you for dining with us! Your payment has been received. Here's your itemized invoice.
        </p>

        <!-- Invoice Info -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; padding: 20px; background: #f9fafb; border-radius: 8px;">
          <div>
            <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Bill Number</div>
            <div style="font-size: 18px; font-weight: 700; color: #111;">#${String(params.billNumber).padStart(6, '0')}</div>
          </div>
          <div>
            <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Order ID</div>
            <div style="font-size: 14px; font-weight: 600; color: #111; font-family: 'Courier New', monospace;">${params.orderId}</div>
          </div>
          <div>
            <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Date</div>
            <div style="font-size: 14px; color: #555;">${new Date(params.createdAt).toLocaleDateString()}</div>
          </div>
          <div>
            <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Time</div>
            <div style="font-size: 14px; color: #555;">${new Date(params.createdAt).toLocaleTimeString()}</div>
          </div>
        </div>

        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr style="border-bottom: 2px solid #667eea; background: #f9fafb;">
              <th style="padding: 12px 0; text-align: left; font-size: 13px; font-weight: 700; color: #111; text-transform: uppercase; letter-spacing: 0.5px;">Item</th>
              <th style="padding: 12px 0; text-align: center; font-size: 13px; font-weight: 700; color: #111; text-transform: uppercase; letter-spacing: 0.5px;">Qty</th>
              <th style="padding: 12px 0; text-align: right; font-size: 13px; font-weight: 700; color: #111; text-transform: uppercase; letter-spacing: 0.5px;">Unit Price</th>
              <th style="padding: 12px 0; text-align: right; font-size: 13px; font-weight: 700; color: #111; text-transform: uppercase; letter-spacing: 0.5px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <!-- Total Section -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 24px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 18px; font-weight: 700; color: #ffffff;">Total Amount</div>
            <div style="font-size: 28px; font-weight: 800; color: #ffffff;">$${params.totalAmount.toFixed(2)}</div>
          </div>
        </div>

        <!-- Payment Details -->
        <div style="background: #f9fafb; border-left: 4px solid #667eea; padding: 20px; border-radius: 6px; margin-bottom: 24px;">
          <div style="font-size: 13px; font-weight: 700; color: #111; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">Payment Details</div>
          <table style="width: 100%; font-size: 14px; line-height: 1.8;">
            <tr>
              <td style="color: #6b7280;">Payment Method:</td>
              <td style="text-align: right; font-weight: 600; color: #111;">${params.paymentMethod}</td>
            </tr>
            <tr>
              <td style="color: #6b7280;">Amount Tendered:</td>
              <td style="text-align: right; color: #555;">$${params.amountTendered.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="color: #6b7280;">Change Given:</td>
              <td style="text-align: right; color: #555;">$${params.changeGiven.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="color: #6b7280;">Transaction ID:</td>
              <td style="text-align: right; font-family: 'Courier New', monospace; font-size: 12px; color: #555;">${params.transactionId}</td>
            </tr>
            <tr>
              <td style="color: #6b7280;">Paid At:</td>
              <td style="text-align: right; color: #555;">${new Date(params.paidAt).toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <!-- Status Badge -->
        <div style="text-align: center; padding: 16px; background: #ecfdf5; border-radius: 8px; border: 1px solid #a7f3d0; margin-bottom: 24px;">
          <div style="font-size: 14px; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 0.5px;">✓ Payment Received</div>
          <div style="font-size: 13px; color: #047857; margin-top: 4px;">Your order is fully paid and confirmed</div>
        </div>

        <!-- Footer Message -->
        <div style="text-align: center; padding: 20px; background: #f3f4f6; border-radius: 8px;">
          <p style="margin: 0 0 12px; font-size: 14px; color: #111; font-weight: 600;">Thank You for Your Business!</p>
          <p style="margin: 0; font-size: 13px; color: #6b7280; line-height: 1.6;">
            We truly appreciate your patronage and look forward to serving you again soon.<br>
            Your satisfaction is our priority.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #1f2937; color: #f3f4f6; padding: 20px 30px; text-align: center; border-radius: 0 0 12px 12px; font-size: 12px;">
        <p style="margin: 0;">© 2026 ${params.restaurantName || 'TableTap'}. All rights reserved.</p>
        <p style="margin: 8px 0 0; color: #9ca3af;">This is an automated receipt. Please retain for your records.</p>
      </div>
    </div>
  `;

    const pdf = await buildInvoicePdf({
        restaurantName: params.restaurantName,
        restaurantPhone: params.restaurantPhone,
        restaurantAddress: params.restaurantAddress,
        orderId: params.orderId,
        billNumber: params.billNumber,
        createdAt: params.createdAt,
        items: params.items,
        totalAmount: params.totalAmount,
        paymentMethod: params.paymentMethod,
        amountTendered: params.amountTendered,
        changeGiven: params.changeGiven,
        paidAt: params.paidAt,
        transactionId: params.transactionId,
    });

    const info = await sendWithRetry(() =>
        transporter.sendMail({
            from: `"TableTap" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Payment Received - Invoice from ' + (params.restaurantName || 'TableTap'),
            html,
            attachments: [
                {
                    filename: `invoice-${params.billNumber}.pdf`,
                    content: pdf,
                    contentType: 'application/pdf',
                },
            ],
        })
    );
    console.log('Invoice Email sent:', info.messageId);
};
