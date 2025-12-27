import { Request } from 'express';
import jwt from 'jsonwebtoken';

export const checkSessionAndGetUserId = (req: Request) => {
  const token = req.cookies.token as string;
  if (!token) {
    return { success: false, userId: null };
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    console.log('PAYLOAD', payload.id);
    return { success: true, userId: payload.id };
  } catch {
    return { success: false, userId: null };
  }
};
