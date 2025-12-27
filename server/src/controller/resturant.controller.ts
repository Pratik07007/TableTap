import { Response } from 'express';

import { createResturantService, updateResturantService } from '../service/resturant.service';

export const createResturantController = async (req: any, res: Response) => {
  const requestedAdmin = req.user;
  if (requestedAdmin.resturant) {
    return res.status(409).json({
      message: 'User Already has a resturant, cannot have more than one',
      success: false,
    });
  }
  const { name, streetAddress, city, state, country, zip, phone, email, faceBookUrl, tikTokUrl, instagramUrl } = req.body;

  const createResturantResponse = await createResturantService(requestedAdmin.id, name, streetAddress, city, state, country, zip, phone, email, faceBookUrl, tikTokUrl, instagramUrl);
  if (!createResturantResponse.success) {
    return res.status(createResturantResponse.code).json({ ...createResturantResponse });
  }

  res.status(createResturantResponse.code).json({
    message: 'Resturant created successfully',
    success: true,
    data: createResturantResponse.data,
  });
};

export const getMyResturantController = async (req: any, res: Response) => {
  const requestedAdmin = req.user;
  if (!requestedAdmin.resturant) {
    return res.status(404).json({ success: false, data: null, message: 'Resturant not found' });
  }
  return res.status(200).json({ success: true, data: requestedAdmin.resturant });
};

export const updateMyResturantController = async (req: any, res: Response) => {
  const requestedAdmin = req.user;
  if (!requestedAdmin.resturant) {
    return res.status(404).json({ success: false, data: null, message: 'Resturant not found' });
  }
  const resp = await updateResturantService(requestedAdmin.id, req.body);
  if (!resp.success) {
    return res.status(resp.code).json({ ...resp });
  }
  return res.status(resp.code).json({
    success: true,
    message: 'Resturant updated successfully',
    data: resp.data,
  });
};
