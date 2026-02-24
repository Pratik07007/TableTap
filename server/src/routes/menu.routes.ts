import { Router } from 'express';
import { createMenuItem, deleteMenuItem, getMenuItems, getMenuItem, getCategory, getUnits, makeMenuItemAvailable, updateMenuItem, getPublicMenuItems } from '../controller/menuItem.controller';

import { validate } from '../middleware/validiate.middleware';
import { menuItemSchema, updateMenuItemSchema } from '../types/zod';
import { protect } from '../middleware/protect';
import upload from '../utils/cloudinary';

const menuItemRouter = Router();

menuItemRouter.get('/', protect('admin'), getMenuItems);

menuItemRouter.post('/', protect('admin'), upload.array('images', 5), validate(menuItemSchema), createMenuItem);

menuItemRouter.get('/public/:resturantID', getPublicMenuItems);

menuItemRouter.get('/:id', protect('admin'), getMenuItem);
menuItemRouter.put('/:id', protect('admin'), upload.array('images', 5), validate(updateMenuItemSchema), updateMenuItem);
menuItemRouter.delete('/:id', protect('admin'), deleteMenuItem);
menuItemRouter.patch('/:id/available', protect('admin'), makeMenuItemAvailable);

menuItemRouter.get('/get/categories', protect('admin'), getCategory);
menuItemRouter.get('/get/units', protect('admin'), getUnits);

export default menuItemRouter;
