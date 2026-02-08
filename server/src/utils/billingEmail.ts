import { transporter } from './mail.config';

export const sendBillPaymentEmail = async (email: string, userParams: { firstName: string; lastName: string }, orderId: string, amount: number, date: Date) => {
  const info = await transporter.sendMail({
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
  });

  console.log('Billing Email sent:', info.messageId);
};

export const sendInvoiceEmail = async (email: string, params: {
  firstName?: string;
  lastName?: string;
  orderId: string;
  billNumber: number;
  createdAt: Date;
  items: Array<{ name: string; unitName: string; quantity: number; price: number }>;
  totalAmount: number;
}) => {
  const rows = params.items.map(
    (i) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">
          <div style="font-weight:600;color:#111;">${i.name}</div>
          <div style="font-size:12px;color:#666;">${i.unitName}</div>
        </td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;color:#555;">${i.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;color:#555;">$${i.price.toFixed(2)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;font-weight:600;color:#111;">$${(i.price * i.quantity).toFixed(2)}</td>
      </tr>
    `
  ).join('');

  const html = `
    <div style="max-width:680px;margin:0 auto;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,'Apple Color Emoji','Segoe UI Emoji';color:#111;">
      <div style="background:#111;color:#fff;padding:24px;border-radius:12px 12px 0 0;display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:24px;font-weight:800;">TableTap Invoice</div>
          <div style="font-size:12px;opacity:.8">#${String(params.billNumber).padStart(6,'0')}</div>
        </div>
        <div style="text-align:right;font-size:12px">
          <div>Order: ${params.orderId.slice(0,8)}</div>
          <div>Date: ${new Date(params.createdAt).toLocaleDateString()}</div>
        </div>
      </div>
      <div style="background:#fff;border:1px solid #eee;border-top:none;padding:24px;border-radius:0 0 12px 12px">
        <p style="margin:0 0 12px">Hello ${params.firstName ?? 'Customer'},</p>
        <p style="margin:0 0 16px;color:#444">Thanks for dining with us. Here is your itemized bill.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <thead>
            <tr style="background:#f7f7f7;border-bottom:1px solid #eee;color:#555">
              <th style="padding:10px;text-align:left">Item</th>
              <th style="padding:10px;text-align:center">Qty</th>
              <th style="padding:10px;text-align:right">Price</th>
              <th style="padding:10px;text-align:right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <div style="background:#fafafa;border:1px solid #eee;border-radius:8px;padding:16px;display:flex;justify-content:space-between;align-items:center">
          <div style="font-size:14px;color:#666">Total Due</div>
          <div style="font-size:18px;font-weight:800;color:#111">$${params.totalAmount.toFixed(2)}</div>
        </div>
        <div style="margin-top:16px;font-size:12px;color:#777">For reference, keep this email with your order ID.</div>
        <div style="margin-top:24px;font-size:12px;color:#aaa">TableTap</div>
      </div>
    </div>
  `;

  const info = await transporter.sendMail({
    from: `"TableTap" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your TableTap Invoice',
    html,
  });
  console.log('Invoice Email sent:', info.messageId);
};
