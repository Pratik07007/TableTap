import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Authentication token not found or invalid",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { role: string; id: string };
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: "Invalid token format",
      });
    }

    (req as any).user = decoded;

    next();
  } catch (error) {
    console.error("Error in isLoggedIn middleware:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error during authentication",
    });
  }
};
