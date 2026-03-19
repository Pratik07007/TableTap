import { prisma } from '../../prisma/client';
import { sendCustomerOrderEmail, sendAdminPlacedOrderEmail } from '../utils/orderEmail';

export const createOrderService = async (userId: string, resturantId: string, resturantOwnerId: string, data: { items: any[]; discount?: number; customerEmail?: string }) => {
  try {
    const { items, discount, customerEmail } = data;
    let orderUserId = userId;
    if (customerEmail) {
      const customer = await prisma.user.findUnique({ where: { email: customerEmail } });
      if (!customer) {
        return { success: false, message: 'No account found for the provided customer email', code: 404 };
      }
      orderUserId = customer.id;
    }

    if (userId !== resturantOwnerId) {
      return { success: false, message: 'You are not the owner of the resturant', code: 400 };
    }

    if (!items || items.length === 0) {
      return { success: false, message: 'No items in order', code: 400 };
    }

    // Use transaction for data integrity
    const order = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = [];

      // Validate items and calculate total
      for (const item of items) {
        const menuItem = await tx.menuItem.findUnique({
          where: { id: item.menuItemId },
          include: { unit: true },
        });

        if (!menuItem) {
          throw new Error(`Menu item not found: ${item.menuItemId}`);
        }

        // Find the specific unit price
        const unitData = menuItem.unit.find((u) => u.unit === item.unitName);
        if (!unitData) {
          throw new Error(`Unit '${item.unitName}' not found for item '${menuItem.name}'`);
        }

        // SECURITY: Use server-side price, not client-side
        const price = unitData.price;
        totalAmount += price * item.quantity;

        orderItemsData.push({
          menuItemId: item.menuItemId,
          unitName: item.unitName,
          price: price,
          quantity: item.quantity,
        });
      }

      const finalAmount = Math.max(0, totalAmount - (discount || 0));

      // Create Order and Items
      const newOrder = await tx.order.create({
        data: {
          totalAmount,
          discount: discount || 0,
          finalAmount,
          status: 'PENDING',
          userId: orderUserId,
          resturantID: resturantId,
          customerEmail: customerEmail || null,
          items: {
            create: orderItemsData,
          },
        },
        include: { items: true },
      });

      return newOrder;
    });

    if (data.customerEmail) {
      const orderWithItems = await prisma.order.findUnique({
        where: { id: order.id },
        include: { items: { include: { menuItem: true } } },
      });
      if (orderWithItems) {
        try {
          const restaurant = await prisma.resturants.findUnique({
            where: { id: resturantId },
          });
          await sendAdminPlacedOrderEmail(data.customerEmail, {
            orderId: order.id,
            items: orderWithItems.items.map((i) => ({
              name: i.menuItem.name,
              unitName: i.unitName,
              quantity: i.quantity,
              price: i.price,
            })),
            totalAmount: order.finalAmount,
            estimatedTime: '30-45 minutes',
            supportEmail: restaurant?.email || process.env.EMAIL_USER || '',
            supportPhone: restaurant?.phone,
          });
        } catch (e) {
          console.error('Failed to send admin placed order email', e);
        }
      }
    }

    return { success: true, data: order, code: 201 };
  } catch (error: any) {
    console.error('Create Order Error:', error);
    return { success: false, message: error.message || 'Order creation failed', code: 400 };
  }
};

export const createCustomerOrderService = async (userId: string, data: { items: any[]; resturantID: string }) => {
  try {
    const { items, resturantID } = data;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!items || items.length === 0) {
      return { success: false, message: 'No items in order', code: 400 };
    }

    if (!resturantID) {
      return { success: false, message: 'Restaurant ID is required', code: 400 };
    }

    // Use transaction for data integrity
    const order = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = [];

      // Validate items and calculate total
      for (const item of items) {
        const menuItem = await tx.menuItem.findUnique({
          where: { id: item.menuItemId },
          include: { unit: true },
        });

        if (!menuItem) {
          throw new Error(`Menu item not found: ${item.menuItemId}`);
        }

        // Verify item belongs to the restaurant
        if (menuItem.resturantID !== resturantID) {
          throw new Error(`Item ${menuItem.name} does not belong to this restaurant`);
        }

        // Find the specific unit price
        const unitData = menuItem.unit.find((u) => u.unit === item.unitName);
        if (!unitData) {
          throw new Error(`Unit '${item.unitName}' not found for item '${menuItem.name}'`);
        }

        const price = unitData.price;
        totalAmount += price * item.quantity;

        orderItemsData.push({
          menuItemId: item.menuItemId,
          unitName: item.unitName,
          price: price,
          quantity: item.quantity,
        });
      }

      const finalAmount = totalAmount; // No discount for customers directly

      // Create Order and Items
      const newOrder = await tx.order.create({
        data: {
          totalAmount,
          discount: 0,
          finalAmount,
          status: 'PENDING',
          userId: userId,
          resturantID: resturantID,
          customerEmail: user?.email || null,
          items: {
            create: orderItemsData,
          },
        },
        include: { items: true },
      });

      return newOrder;
    });

    const orderWithItems = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: { include: { menuItem: true } }, user: true },
    });
    if (orderWithItems?.user?.email) {
      try {
        await sendCustomerOrderEmail(orderWithItems.user.email, {
          firstName: orderWithItems.user.firstName,
          orderId: order.id,
          items: orderWithItems.items.map((i) => ({
            name: i.menuItem.name,
            unitName: i.unitName,
            quantity: i.quantity,
            price: i.price,
          })),
          totalAmount: order.finalAmount,
          paymentLink: `${process.env.FRONTEND_URL}/payment/${order.id}`,
          estimatedTime: '30-45 minutes',
        });
      } catch (e) {
        console.error('Failed to send customer order email', e);
      }
    }

    return { success: true, data: order, code: 201 };
  } catch (error: any) {
    console.error('Create Customer Order Error:', error);
    return { success: false, message: error.message || 'Order creation failed', code: 400 };
  }
};

export const getMyOrdersService = async (userId: string, page: number = 1, limit: number = 10) => {
  try {
    const skip = (page - 1) * limit;

    const totalOrders = await prisma.order.count({
      where: { userId },
    });

    const orders = await prisma.order.findMany({
      where: { userId },
      skip,
      take: limit,
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        restaurant: {
          select: {
            name: true, // Include restaurant name for display
          },
        },
        bill: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalPages = Math.ceil(totalOrders / limit);

    return {
      success: true,
      data: orders,
      pagination: {
        totalOrders,
        totalPages,
        currentPage: page,
        limit: limit,
      },
      code: 200,
    };
  } catch (error: any) {
    console.error('Get My Orders Error:', error);
    return { success: false, message: 'Failed to fetch orders', code: 500 };
  }
};

export const getAllOrdersService = async (
  resturantId: string | undefined,
  page: number = 1,
  limit: number = 10,
  email?: string,
  paid?: 'true' | 'false' | 'all'
) => {
  try {
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (resturantId) {
      whereClause.resturantID = resturantId;
    }

    if (paid === 'true') {
      whereClause.isPaid = true;
    } else if (paid === 'false' || !paid) {
      whereClause.isPaid = false;
    }

    if (email) {
      whereClause.user = {
        email: {
          contains: String(email),
          mode: 'insensitive',
        },
      };
    }

    const totalOrders = await prisma.order.count({
      where: whereClause,
    });

    const orders = await prisma.order.findMany({
      where: whereClause,
      skip: skip,
      take: limit,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        items: {
          include: {
            menuItem: true,
          },
        },
        bill: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalPages = Math.ceil(totalOrders / limit);

    return {
      success: true,
      data: orders,
      pagination: {
        totalOrders,
        totalPages,
        currentPage: page,
        limit: limit,
      },
      code: 200,
    };
  } catch (error: any) {
    console.error('Get All Orders Error:', error);
    return { success: false, message: 'Failed to fetch orders', code: 500 };
  }
};

export const updateOrderStatusService = async (id: string, status: string) => {
  try {
    const validStatuses = ['PENDING', 'COOKING', 'READY', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return { success: false, message: 'Invalid status', code: 400 };
    }

    const currentOrder = await prisma.order.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!currentOrder) {
      return { success: false, message: 'Order not found', code: 404 };
    }

    const currentStatus = currentOrder.status;

    // Strict State Machine
    let isValidTransition = false;

    if (currentStatus === 'PENDING') {
      if (status === 'COOKING' || status === 'CANCELLED') isValidTransition = true;
    } else if (currentStatus === 'COOKING') {
      if (status === 'READY') isValidTransition = true;
    } else if (currentStatus === 'READY') {
      if (status === 'COMPLETED') isValidTransition = true;
    }
    // COMPLETED and CANCELLED are terminal, no transitions allowed out of them.
    // Also, if status is same (no change), it's technically valid or ignored, but let's allow it or just update.
    if (currentStatus === (status as any)) isValidTransition = true;

    if (!isValidTransition) {
      return {
        success: false,
        message: `Invalid transition from ${currentStatus} to ${status}`,
        code: 400,
      };
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status: status as any },
    });

    return { success: true, data: order, code: 200 };
  } catch (error: any) {
    console.error('Update Order Status Error:', error);
    return { success: false, message: 'Failed to update order status', code: 500 };
  }
};

export const cancelOrderService = async (userId: string, orderId: string) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return { success: false, message: 'Order not found', code: 404 };
    }

    if (order.userId !== userId) {
      return { success: false, message: 'Unauthorized', code: 403 };
    }

    if (order.status !== 'PENDING') {
      return { success: false, message: 'Only pending orders can be cancelled', code: 400 };
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });

    return { success: true, data: updatedOrder, code: 200 };
  } catch (error: any) {
    console.error('Cancel Order Error:', error);
    return { success: false, message: 'Failed to cancel order', code: 500 };
  }
};

export const updateOrderService = async (userId: string, orderId: string, newItems: any[]) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return { success: false, message: 'Order not found', code: 404 };
    }

    if (order.userId !== userId) {
      return { success: false, message: 'Unauthorized', code: 403 };
    }

    if (order.status !== 'PENDING') {
      return { success: false, message: 'Only pending orders can be updated', code: 400 };
    }

    if (!newItems || newItems.length === 0) {
      return { success: false, message: 'No items provided', code: 400 };
    }

    // Transaction to ensure atomicity
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Delete existing items
      await tx.orderItem.deleteMany({
        where: { orderId: orderId },
      });

      let totalAmount = 0;
      const orderItemsData = [];

      // 2. Validate and prepare new items
      for (const item of newItems) {
        const menuItem = await tx.menuItem.findUnique({
          where: { id: item.menuItemId },
          include: { unit: true },
        });

        if (!menuItem) {
          throw new Error(`Menu item not found: ${item.menuItemId}`);
        }

        const unitData = menuItem.unit.find((u) => u.unit === item.unitName);
        if (!unitData) {
          throw new Error(`Unit '${item.unitName}' not found for item '${menuItem.name}'`);
        }

        const price = unitData.price;
        totalAmount += price * item.quantity;

        orderItemsData.push({
          menuItemId: item.menuItemId,
          unitName: item.unitName,
          price: price,
          quantity: item.quantity,
          orderId: orderId,
        });
      }

      const finalAmount = totalAmount;

      // 3. Create new items
      await tx.orderItem.createMany({
        data: orderItemsData,
      });

      // 4. Update Order
      const result = await tx.order.update({
        where: { id: orderId },
        data: {
          totalAmount,
          finalAmount,
          updatedAt: new Date(),
        },
        include: { items: { include: { menuItem: true } } },
      });

      return result;
    });

    return { success: true, data: updatedOrder, code: 200 };
  } catch (error: any) {
    console.error('Update Order Error:', error);
    return { success: false, message: error.message || 'Failed to update order', code: 500 };
  }
};
