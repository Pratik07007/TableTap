import { Request, Response } from "express";
import {
  loginService,
  registerUserService,
  verifyEmailService,
  forgotPasswordService,
  resetPasswordService,
} from "../service/auth.service";

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
    return res
      .status(400)
      .json({ message: "Token is required", success: false });
  }
  const response = await verifyEmailService(token);
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
  res.cookie("token", response.token);
  res.status(200).json({ ...response });
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
