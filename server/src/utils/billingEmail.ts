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
