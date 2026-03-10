import { Response } from 'express';
import { createOrderService, createCustomerOrderService, getMyOrdersService, getAllOrdersService, updateOrderStatusService, cancelOrderService, updateOrderService } from '../service/order.service';

export const createOrder = async (req: any, res: Response) => {
  const result = await createOrderService(req.user.id, req.user.resturant.id, req.user.resturant.userId, req.body);
  if (result.success) {
    res.status(result.code).json({ success: true, data: result.data });
  } else {
    res.status(result.code).json({ success: false, message: result.message });
  }
};

export const createCustomerOrder = async (req: any, res: Response) => {
  const result = await createCustomerOrderService(req.user.id, req.body);

  if (result.success) {
    res.status(result.code).json({ success: true, data: result.data });
  } else {
    res.status(result.code).json({ success: false, message: result.message });
  }
};

export const getMyOrders = async (req: any, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await getMyOrdersService(req.user.id, Number(page), Number(limit));

  if (result.success) {
    res.status(result.code).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } else {
    res.status(result.code).json({ success: false, message: result.message });
  }
};

export const getAllOrders = async (req: any, res: Response) => {
  const { page = 1, limit = 10, email, paid } = req.query;
  const result = await getAllOrdersService(req.user.resturant?.id, Number(page), Number(limit), email as string, paid as any);

  if (result.success) {
    res.status(result.code).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } else {
    res.status(result.code).json({ success: false, message: result.message });
  }
};

export const updateOrderStatus = async (req: any, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await updateOrderStatusService(id, status);

  if (result.success) {
    res.status(result.code).json({ success: true, data: result.data });
  } else {
    res.status(result.code).json({ success: false, message: result.message });
  }
};

export const cancelOrder = async (req: any, res: Response) => {
  const { id } = req.params;
  const result = await cancelOrderService(req.user.id, id);

  if (result.success) {
    res.status(result.code).json({ success: true, data: result.data });
  } else {
    res.status(result.code).json({ success: false, message: result.message });
  }
};

export const updateOrder = async (req: any, res: Response) => {
  const { id } = req.params;
  const { items } = req.body;
  const result = await updateOrderService(req.user.id, id, items);

  if (result.success) {
    res.status(result.code).json({ success: true, data: result.data });
  } else {
    res.status(result.code).json({ success: false, message: result.message });
  }
};
