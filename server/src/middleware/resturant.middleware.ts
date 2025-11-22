import { NextFunction, Request, Response } from "express";
import { resturantSchema } from "../types/zod";
import { checkSessionAndGetUserId } from "../utils/checkSession";

export const createResturantInputValidiationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    name,
    streetAddress,
    city,
    state,
    zip,
    country,
    phone,
    email,
    faceBookUrl,
    tikTokUrl,
    instagramUrl,
  } = req.body;
  const result = resturantSchema.safeParse({
    name,
    streetAddress,
    city,
    state,
    zip,
    country,
    phone,
    email,
    faceBookUrl,
    tikTokUrl,
    instagramUrl,
  });
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return res.status(400).json({
      message: errors,
      success: false,
    });
  }
  next();
};

export const updateResturantInputValidationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    name,
    streetAddress,
    city,
    state,
    zip,
    country,
    phone,
    email,
    faceBookUrl,
    tikTokUrl,
    instagramUrl,
  } = req.body;
  const result = resturantSchema.safeParse({
    name,
    streetAddress,
    city,
    state,
    zip,
    country,
    phone,
    email,
    faceBookUrl,
    tikTokUrl,
    instagramUrl,
  });
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return res.status(400).json({
      message: errors,
      success: false,
    });
  }
  next();
};
