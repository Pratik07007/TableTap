import { NextFunction, Request, Response } from "express";
import z from "zod";
import { loginSchema, registerSchema } from "../types/zod";

export const registerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Validate request body against registerSchema
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return res.status(400).json({ success: false, message: { errors } });
  }
  next();
};

export const loginMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return res.status(400).json({ success: false, message: { errors } });
  }
  next();
};

export const forgotPasswordMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = z.object({
    email: z.string().email("Invalid email address"),
  });
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return res.status(400).json({ result: { errors } });
  }
  next();
};

export const resetPasswordMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = z.object({
    token: z.string().min(1, "Token is required"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  });
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return res.status(400).json({ result: { errors } });
  }
  if (req.body.password !== req.body.confirmPassword) {
    return res
      .status(400)
      .json({ result: { errors: [{ message: "Passwords do not match" }] } });
  }
  next();
};
