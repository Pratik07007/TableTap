import { prisma } from '../../prisma/client';

export const createOrderService = async (userId: string, resturantId: string, resturantOwnerId: string, data: { items: any[]; discount?: number }) => {
  try {
    const { items, discount } = data;

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
          userId: userId,
          resturantID: resturantId,
          items: {
            create: orderItemsData,
          },
        },
        include: { items: true },
      });

      return newOrder;
    });

    return { success: true, data: order, code: 201 };
  } catch (error: any) {
    console.error('Create Order Error:', error);
    return { success: false, message: error.message || 'Order creation failed', code: 400 };
  }
};

export const createCustomerOrderService = async (userId: string, data: { items: any[]; resturantID: string }) => {
  try {
    const { items, resturantID } = data;

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
          items: {
            create: orderItemsData,
          },
        },
        include: { items: true },
      });

      return newOrder;
    });

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

export const getAllOrdersService = async (resturantId: string | undefined, page: number = 1, limit: number = 10, email?: string) => {
  try {
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (resturantId) {
      whereClause.resturantID = resturantId;
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
    const validStatuses = ['PENDING', 'COOKING', 'READY', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return { success: false, message: 'Invalid status', code: 400 };
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
