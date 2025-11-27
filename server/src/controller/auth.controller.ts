import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  loginService,
  registerUserService,
  verifyEmailService,
  forgotPasswordService,
  resetPasswordService,
} from "../service/auth.service";
import { createResturantService } from "../service/resturant.service";
import { prisma } from "../prisma/client";

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
  res.cookie("token", response.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
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

export const registerRestaurantController = async (
  req: Request,
  res: Response
) => {
  const {
    name,
    email,
    address,
    city,
    state,
    country,
    zipCode,
    phoneNumber,
    faceBookUrl,
    tikTokUrl,
    instagramUrl,
  } = req.body;

  const response = await createResturantService(
    "!2312",
    name,
    address,
    city,
    state,
    country,
    zipCode,
    phoneNumber,
    email,
    faceBookUrl,
    tikTokUrl,
    instagramUrl
  );
  if (!response.success) {
    return res.status(400).json({ ...response });
  }
  res.status(201).json({ ...response });
};

export const validateSessionController = async (
  req: Request,
  res: Response
) => {
  const token = req.cookies.token;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired session" });
    }
    return res.status(200).json({
      success: true,
      data: {
        email: user.email,
        role: user.role,
        name: `${user.firstName} ${user.lastName}`,
      },
    });
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired session" });
  }
};

export const logoutController = (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax",
    path: "/",
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};
