import { Request, Response } from 'express';
import { checkSessionAndGetUserId } from '../utils/checkSession';

import { createResturantService, updateResturantService } from '../service/resturant.service';
import { prisma } from '../../prisma/client';

export const createResturantController = async (req: Request, res: Response) => {
  const session = checkSessionAndGetUserId(req);
  if (!session.success) {
    return res.json({ ...session, msg: 'Please login to create a resturant' });
  }
  const userId = session.userId;

  const user = await prisma.user.findUnique({
    where: {
      id: userId as string,
    },
    select: {
      role: true,
    },
  });
  if (!user) {
    return res.status(400).json({
      message: 'The user not found',
      success: false,
    });
  }
  if (user.role !== 'ADMIN') {
    return res.status(400).json({
      message: 'Only admin can create a resturant',
      success: false,
    });
  }
  const { name, streetAddress, city, state, country, zip, phone, email, faceBookUrl, tikTokUrl, instagramUrl } = req.body;

  const createResturantResponse = await createResturantService(userId as string, name, streetAddress, city, state, country, zip, phone, email, faceBookUrl, tikTokUrl, instagramUrl);
  if (!createResturantResponse.success) {
    return res.status(400).json({ ...createResturantResponse });
  }

  res.status(200).json({
    message: 'Resturant created successfully',
    success: true,
  });
};

export const getMyResturantController = async (req: Request, res: Response) => {
  const session = checkSessionAndGetUserId(req);
  if (!session.success) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  const userId = session.userId as string;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { resturant: true },
  });
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  if (!user.resturant) {
    return res.status(200).json({ success: true, data: null });
  }
  return res.status(200).json({ success: true, data: user.resturant });
};

export const updateMyResturantController = async (req: Request, res: Response) => {
  const session = checkSessionAndGetUserId(req);
  if (!session.success) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  const userId = session.userId as string;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  if (user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Only admin can update restaurant' });
  }

  const { name, streetAddress, city, state, country, zip, phone, email, faceBookUrl, tikTokUrl, instagramUrl } = req.body;

  const resp = await updateResturantService(userId, name, streetAddress, city, state, country, zip, phone, email, faceBookUrl, tikTokUrl, instagramUrl);
  if (!resp.success) {
    return res.status(400).json({ ...resp });
  }
  return res.status(200).json({
    success: true,
    message: 'Resturant updated successfully',
    data: resp.data,
  });
};
