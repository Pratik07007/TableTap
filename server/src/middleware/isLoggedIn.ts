import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

//This middleware function runs before the controller to check if the user is logged in
export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Authentication token not found or invalid",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
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
