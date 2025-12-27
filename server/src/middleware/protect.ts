import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../../prisma/client';

export const protect = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // console.log(' Protect called');
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        error: 'Authentication token not found',
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
        role: string;
      };

      if (!decoded) {
        return res.status(401).json({
          error: 'Invalid authentication token',
        });
      }
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          role: true,
          email: true,
          resturant: true,
          firstName: true,
          lastName: true,
        },
      });

      if (!user) {
        return res.status(401).json({
          error: 'Insufficient permissions',
        });
      }
      if (roles.length > 0 && !roles.map((r) => r.toUpperCase()).includes(user.role.toUpperCase())) {
        return res.status(403).json({
          error: 'Insufficient permissions',
        });
      }

      (req as any).user = user;
      next();
    } catch (error) {
      console.log('Error From src/middleware/protect.ts', error);
      return res.status(401).json({
        error: 'Invalid or expired token',
      });
    }
  };
};
