import { Request, Response } from 'express';
import { loginService, registerUserService, verifyEmailService, forgotPasswordService, resetPasswordService, resendVerificationEmailService } from '../service/auth.service';

export const registerUserController = async (req: Request, res: Response) => {
  const { fName, lName, email, password, role } = req.body;

  const response = await registerUserService({
    fName,
    lName,
    email,
    password,
    role,
  });
  if (!response.success) {
    const statusCode = response.code;
    return res.status(statusCode).json({ ...response });
  }
  res.status(201).json({ ...response });
};

export const verifyEmailController = async (req: Request, res: Response) => {
  const { token } = req.body;
  const response = await verifyEmailService(token);
  if (!response.success) {
    return res.status(response.code).json({ ...response });
  }
  res.status(200).json({ ...response });
};

export const resendVerificationEmailController = async (req: Request, res: Response) => {
  const { email } = req.body;
  const response = await resendVerificationEmailService(email);
  if (!response.success) {
    return res.status(response.code).json({ ...response });
  }
  res.status(200).json({ ...response });
};

export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const response = await loginService(email, password);
  if (!response.success) {
    return res.status(response.code).json({ ...response });
  }
  res.cookie('token', response.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  });

  res.status(response.code).json({ ...response });
};

export const forgotPasswordController = async (req: Request, res: Response) => {
  const { email } = req.body;
  const response = await forgotPasswordService(email);
  return res.status(response.code).json({ ...response });
};

export const resetPasswordController = async (req: Request, res: Response) => {
  const { token, password } = req.body;
  const response = await resetPasswordService(token, password);
  console.log('response in the controller', response);
  return res.status(response.code).json({ ...response });
};

export const logoutController = (req: Request, res: Response) => {
  res.clearCookie('token');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};
