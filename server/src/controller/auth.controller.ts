import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import {
  loginService,
  registerUserService,
  verifyEmailService,
  forgotPasswordService,
  resetPasswordService,
  resendVerificationEmailService,
} from '../service/auth.service';
import { prisma } from '../../prisma/client';

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
    return res.status(400).json({ ...response });
  }
  res.status(201).json({ ...response });
};

export const verifyEmailController = async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: 'Token is required', success: false });
  }
  const response = await verifyEmailService(token);
  if (!response.success) {
    return res.status(400).json({ ...response });
  }
  res.status(200).json({ ...response });
};

export const resendVerificationEmailController = async (req: Request, res: Response) => {
  const { email } = req.body;
  const response = await resendVerificationEmailService(email);
  if (!response.success) {
    return res.status(400).json({ ...response });
  }
  res.status(200).json({ ...response });
};

export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const response = await loginService(email, password);
  if (!response.success) {
    return res.status(400).json({ ...response });
  }
  res.cookie('token', response.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  });
  res.status(200).json({ success: true, message: response.message });
};

export const forgotPasswordController = async (req: Request, res: Response) => {
  const { email } = req.body;
  const response = await forgotPasswordService(email);
  if (!response.success) {
    return res.status(400).json({ ...response });
  }
  res.status(200).json({ ...response });
};

export const resetPasswordController = async (req: Request, res: Response) => {
  const { token, password } = req.body;
  const response = await resetPasswordService(token, password);
  if (!response.success) {
    return res.status(400).json({ ...response });
  }
  res.status(200).json({ ...response });
};

export const getSessionInfoController = async (req: Request, res: Response) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      role: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
      },
    });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired session' });
    }
    return res.status(200).json({
      success: true,
      user: { ...user },
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session' });
  }
};
export const logoutController = (req: Request, res: Response) => {
  res.clearCookie('token');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};
