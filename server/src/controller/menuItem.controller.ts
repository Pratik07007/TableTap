import { Response } from 'express';
import { createMenuService, getMenusService, getPublicMenusService, getMenuService, updateMenuService, deleteMenuService, getCategoryService, getUnitsService, makeMenuAvailableService } from '../service/menuItem.service';

export const getMenuItems = async (req: any, res: Response) => {
  const result = await getMenusService(req.user.resturant.id);
  if (result.success) {
    res.status(result.code).json({ ...result });
  } else {
    res.status(result.code).json({ ...result });
  }
};
export const createMenuItem = async (req: any, res: Response) => {
  const images = req.files ? req.files.map((file: any) => file.path) : [];
  const result = await createMenuService(req.user.resturant.id, { ...req.body, images });
  if (result.success) {
    res.status(result.code).json({ success: true, message: result.message });
  } else {
    res.status(result.code).json({ success: false, error: result.error });
  }
};

export const getPublicMenuItems = async (req: any, res: Response) => {
  const { resturantID } = req.params;
  const result = await getPublicMenusService(resturantID);
  if (result.success) {
    res.status(result.code).json({ success: true, data: result.data });
  } else {
    res.status(result.code).json({ success: false, error: result.error });
  }
};

export const getMenuItem = async (req: any, res: Response) => {
  const { id } = req.params;
  const result = await getMenuService(id, req.user.resturant.id);
  if (result.success) {
    res.status(result.code).json({ success: true, data: result.data });
  } else {
    res.status(result.code).json({ success: false, error: result.error, message: result.message });
  }
};

export const updateMenuItem = async (req: any, res: Response) => {
  const { id } = req.params;
  const images = req.files ? req.files.map((file: any) => file.path) : [];
  const result = await updateMenuService(id, req.user.id, { ...req.body, images });
  if (result.success) {
    res.status(result.code).json({ success: true, data: result.data });
  } else {
    res.status(result.code).json({ success: false, message: result.message, error: result.error });
  }
};

export const deleteMenuItem = async (req: any, res: Response) => {
  const { id } = req.params;
  const result = await deleteMenuService(id, req.user.id);
  if (result.success) {
    res.status(result.code).json({ success: true, message: result.message });
  } else {
    res.status(result.code).json({ success: false, message: result.message });
  }
};

export const getCategory = async (req: any, res: Response) => {
  const result = await getCategoryService();
  if (result.success) {
    res.status(result.code).json({ success: true, data: result.data });
  } else {
    res.status(result.code).json({ success: false, message: result.message });
  }
};

export const getUnits = async (req: any, res: Response) => {
  const result = await getUnitsService();
  if (result.success) {
    res.status(result.code).json({ success: true, data: result.data });
  } else {
    res.status(result.code).json({ success: false, message: result.message, err: result.err });
  }
};

export const makeMenuItemAvailable = async (req: any, res: Response) => {
  const { id } = req.params;
  const result = await makeMenuAvailableService(id, req.user.id);
  if (result.success) {
    res.status(result.code).json({ success: true, message: result.message });
  } else {
    res.status(result.code).json({ success: false, message: result.message });
  }
};
