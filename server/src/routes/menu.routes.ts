import { Router } from 'express';
import { createMenuItem, deleteMenuItem, getMenuItems, getMenuItem, getCategory, getUnits, makeMenuItemAvailable, updateMenuItem, getPublicMenuItems } from '../controller/menuItem.controller';

import { validate } from '../middleware/validiate.middleware';
import { menuItemSchema } from '../types/zod';
import { protect } from '../middleware/protect';

const menuItemRouter = Router();

menuItemRouter.get('/', protect('admin'), getMenuItems);

menuItemRouter.post('/', validate(menuItemSchema), protect('admin'), createMenuItem);

menuItemRouter.get('/public/:resturantID', getPublicMenuItems);
menuItemRouter.get('/:id', protect('admin'), getMenuItem);
menuItemRouter.put('/:id', protect('admin'), updateMenuItem);
menuItemRouter.delete('/:id', protect('admin'), deleteMenuItem);
menuItemRouter.patch('/:id/available', protect('admin'), makeMenuItemAvailable);
menuItemRouter.get('/get/categories', protect('admin'), getCategory);
menuItemRouter.get('/get/units', protect('admin'), getUnits);

export default menuItemRouter;
