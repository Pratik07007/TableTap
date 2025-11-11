import { NextFunction, Request, Response } from "express";
import z from "zod";

export const registerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const registerSchema = z.object({
    fName: z.string().min(1, "First name is required"),
    lName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
        "Confirm password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
  });
  if (req.body.password !== req.body.confirmPassword) {
    return res
      .status(400)
      .json({ result: { errors: [{ message: "Passwords do not match" }] } });
  }
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return res.status(400).json({ result: { errors } });
  }
  next();
};

export const loginMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
  });
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return res.status(400).json({ result: { errors } });
  }
  next();
};
