
import { Response } from "express";
import { prisma } from "../../prisma/client";

export const createOrder = async (req: any, res: Response) => {
  try {
    const { items, discount } = req.body;


    const createOrderRequestedUserId = req.user.id;
    const restaurantId = req.user.resturant.id;

    const resturantOwner =req.user.resturant.userId;
    
    
   if(createOrderRequestedUserId!==resturantOwner){
    return res.status(400).json({ success: false, message: "You are not the owner of the resturant" });
   }


    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "No items in order" });
    }

    // Use transaction for data integrity
    const order = await prisma.$transaction(async (tx) => {
        let totalAmount = 0;
        const orderItemsData = [];

        // Validate items and calculate total
        for (const item of items) {
            const menuItem = await tx.menuItem.findUnique({
                where: { id: item.menuItemId },
                include: { unit: true }
            });

            if (!menuItem) {
                throw new Error(`Menu item not found: ${item.menuItemId}`);
            }

            // Find the specific unit price
            const unitData = menuItem.unit.find(u => u.unit === item.unitName);
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
                quantity: item.quantity
            });
        }

        const finalAmount = Math.max(0, totalAmount - (discount || 0));

        // Create Order and Items
        const newOrder = await tx.order.create({
            data: {
                totalAmount,
                discount: discount || 0,
                finalAmount,
                status: "PENDING",
                userId: createOrderRequestedUserId,
                restaurantId: restaurantId,
                items: {
                    create: orderItemsData
                }
            },
            include: { items: true }
        });

        return newOrder;
    });

    res.status(201).json({ success: true, data: order });
  } catch (error: any) {
    console.error("Create Order Error:", error);
    res.status(400).json({ success: false, message: error.message || "Order creation failed" });
  }
};

export const getAllOrders = async (req: any, res: Response) => {
  try {
    const { page = 1, limit = 10, email } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const whereClause: any = {};

    // Filter by restaurant if user is associated with one
    const userRestaurantId = req.user.resturant?.id;
    if (userRestaurantId) {
        whereClause.restaurantId = userRestaurantId;
    }

    if (email) {
      whereClause.user = {
        email: {
          contains: String(email),
          mode: 'insensitive' 
        }
      };
    }

    
    const totalOrders = await prisma.order.count({
      where: whereClause
    });

    const orders = await prisma.order.findMany({
      where: whereClause,
      skip: skip,
      take: Number(limit),
      include: {
        user: {
            select: {
                firstName: true,
                lastName: true,
                email: true
            }
        },
        items: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const totalPages = Math.ceil(totalOrders / Number(limit));

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        totalOrders,
        totalPages,
        currentPage: Number(page),
        limit: Number(limit)
      }
    });
  } catch (error: any) {
    console.error("Get All Orders Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

export const updateOrderStatus = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["PENDING", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const order = await prisma.order.update({
        where: { id },
        data: { status },
    });

    res.status(200).json({ success: true, data: order });
  } catch(error: any) {
    console.error("Update Order Status Error:", error);
    res.status(500).json({ success: false, message: "Failed to update order status" });
  }
};
