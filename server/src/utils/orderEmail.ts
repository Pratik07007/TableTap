import { transporter } from './mail.config';
import { sendWithRetry } from './emailRetry';

export const sendCustomerOrderEmail = async (email: string, params: {
  firstName?: string;
  orderId: string;
  items: Array<{ name: string; unitName: string; quantity: number; price: number }>;
  totalAmount: number;
  paymentLink: string;
  estimatedTime: string;
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
    <div style="max-width:680px;margin:0 auto;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#111;">
      <div style="background:#111;color:#fff;padding:24px;border-radius:12px 12px 0 0;">
        <div style="font-size:24px;font-weight:800;">TableTap</div>
        <div style="font-size:14px;opacity:.8;">Order Placed Successfully</div>
      </div>
      <div style="background:#fff;border:1px solid #eee;border-top:none;padding:24px;border-radius:0 0 12px 12px;">
        <p style="margin:0 0 8px;">Hello ${params.firstName ?? 'Customer'},</p>
        <p style="margin:0 0 16px;color:#444;">Your order has been placed successfully.</p>
        <div style="font-size:12px;color:#555;margin-bottom:16px;">Order ID: ${params.orderId}</div>
        <div style="font-size:12px;color:#555;margin-bottom:16px;">Estimated time: ${params.estimatedTime}</div>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <thead>
            <tr style="background:#f7f7f7;border-bottom:1px solid #eee;color:#555;">
              <th style="padding:10px;text-align:left;">Item</th>
              <th style="padding:10px;text-align:center;">Qty</th>
              <th style="padding:10px;text-align:right;">Price</th>
              <th style="padding:10px;text-align:right;">Amount</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="background:#fafafa;border:1px solid #eee;border-radius:8px;padding:16px;display:flex;justify-content:space-between;align-items:center;">
          <div style="font-size:14px;color:#666;">Total Due</div>
          <div style="font-size:18px;font-weight:800;color:#111;">$${params.totalAmount.toFixed(2)}</div>
        </div>
        <div style="text-align:center;margin:24px 0;">
          <a href="${params.paymentLink}" style="display:inline-block;background:#111;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;">Pay Now</a>
        </div>
        <div style="font-size:12px;color:#777;">If the button doesn’t work, copy and paste this link:</div>
        <div style="font-size:12px;color:#777;word-break:break-all;">${params.paymentLink}</div>
      </div>
    </div>
  `;

  return sendWithRetry(() => transporter.sendMail({
    from: `"TableTap" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Order Placed Successfully',
    html,
  }));
};

export const sendAdminPlacedOrderEmail = async (email: string, params: {
  orderId: string;
  items: Array<{ name: string; unitName: string; quantity: number; price: number }>;
  totalAmount: number;
  estimatedTime: string;
  supportEmail: string;
  supportPhone?: string;
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
    <div style="max-width:680px;margin:0 auto;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#111;">
      <div style="background:#0f172a;color:#fff;padding:24px;border-radius:12px 12px 0 0;">
        <div style="font-size:22px;font-weight:800;">TableTap Admin Order</div>
        <div style="font-size:13px;opacity:.8;">Order Confirmation</div>
      </div>
      <div style="background:#fff;border:1px solid #eee;border-top:none;padding:24px;border-radius:0 0 12px 12px;">
        <div style="font-size:12px;color:#555;margin-bottom:12px;">Confirmation #: ${params.orderId}</div>
        <div style="font-size:12px;color:#555;margin-bottom:12px;">Expected processing time: ${params.estimatedTime}</div>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <thead>
            <tr style="background:#f1f5f9;border-bottom:1px solid #e2e8f0;color:#475569;">
              <th style="padding:10px;text-align:left;">Item</th>
              <th style="padding:10px;text-align:center;">Qty</th>
              <th style="padding:10px;text-align:right;">Price</th>
              <th style="padding:10px;text-align:right;">Amount</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;display:flex;justify-content:space-between;align-items:center;">
          <div style="font-size:14px;color:#64748b;">Total Due</div>
          <div style="font-size:18px;font-weight:800;color:#0f172a;">$${params.totalAmount.toFixed(2)}</div>
        </div>
        <div style="margin-top:16px;font-size:12px;color:#64748b;">Support: ${params.supportEmail}${params.supportPhone ? ` | ${params.supportPhone}` : ''}</div>
      </div>
    </div>
  `;

  return sendWithRetry(() => transporter.sendMail({
    from: `"TableTap" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Order Confirmation - Admin Placed Order',
    html,
  }));
};
