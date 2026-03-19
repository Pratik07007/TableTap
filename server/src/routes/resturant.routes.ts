import { Router } from 'express';

import { createResturantController, getMyResturantController, updateMyResturantController, getAllResturantsController } from '../controller/resturant.controller';
import { resturantSchema, updateResturantSchema } from '../types/zod';
import { validate } from '../middleware/validiate.middleware';
import { protect } from '../middleware/protect';

export const resturantRouter = Router();

// Public — no auth required
resturantRouter.get('/all', getAllResturantsController);

resturantRouter.use(protect('admin'));

resturantRouter.post('/create', validate(resturantSchema), createResturantController);

resturantRouter.get('/me', getMyResturantController);

resturantRouter.patch('/update', validate(updateResturantSchema), updateMyResturantController);
