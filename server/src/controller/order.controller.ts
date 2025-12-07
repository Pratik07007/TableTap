
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
