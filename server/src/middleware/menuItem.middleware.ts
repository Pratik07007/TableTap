import { Request, Response, NextFunction } from 'express';
import { menuItemSchema, menuItemUpdateSchema } from '../types/zod';

export const validateCreateMenuItem = (req: Request, res: Response, next: NextFunction) => {
  const result = menuItemSchema.safeParse(req.body ?? {});
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    return res.status(400).json({ success: false, message: errors });
  }
  next();
};

export const validateUpdateMenuItem = (req: Request, res: Response, next: NextFunction) => {
  const result = menuItemUpdateSchema.safeParse(req.body ?? {});
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    return res.status(400).json({ success: false, message: errors });
  }
  next();
};