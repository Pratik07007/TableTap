import { NextFunction, Request, Response } from "express";
import z from "zod";

export const registerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    
  });
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ result });
  }
  next();
};

export const loginMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ result });
  }
  next();
};
