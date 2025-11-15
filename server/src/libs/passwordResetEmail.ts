import { transporter } from "../utils/nodeMailer";
import jwt from "jsonwebtoken";

export const sendPasswordResetEmail = async (email: string) => {
  const token = jwt.sign(
    { email, type: "reset" },
    process.env.JWT_SECRET as string
  );
  const info = await transporter.sendMail({
    from: `"TableTap" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password",
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 28px;">Reset your TableTap password</h1>
          <p style="color: #f0f0f0; margin: 10px 0 0; font-size: 16px;">This link expires in 1 hour.</p>
        </div>
        <div style="background: #fff; padding: 40px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <p style="font-size: 16px; line-height: 1.5; margin: 0 0 24px;">Hi,</p>
          <p style="font-size: 16px; line-height: 1.5; margin: 0 0 24px;">
            You requested to reset your password. Click the button below to proceed.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}"
               style="display: inline-block; background: #667eea; color: #fff; padding: 14px 28px; border-radius: 6px; font-size: 16px; font-weight: 600; text-decoration: none;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 14px; color: #666; margin: 0 0 8px;">Or copy and paste this link into your browser:</p>
          <p style="font-size: 14px; color: #666; word-break: break-all; margin: 0;">
            ${process.env.FRONTEND_URL}/reset-password?token=${token}
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
          <p style="font-size: 14px; color: #999; margin: 0;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  });
  console.log("Password reset email sent:", info.messageId);
};
