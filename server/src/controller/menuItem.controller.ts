import { Response } from "express";
import { prisma } from "../../prisma/client";

export const createMenuItem = async (req: any, res: Response) => {
  try {
    const { name, description, price, category, imageUrl, isAvailable, units } =
      req.body;
    const upperCategory = category.toUpperCase();

    let categoryRecord = await prisma.category.findFirst({
      where: { category: upperCategory },
    });

    if (!categoryRecord) {
      categoryRecord = await prisma.category.create({
        data: { category: upperCategory },
      });
    }

    const menu = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: Number(price),
        imageUrl,
        isAvailable,
        restaurantId: req.user.resturant.id,
        categoryId: categoryRecord.id,
      },
    });

    for (const unit of units) {
      await prisma.unit.create({
        data: {
          menuItemId: menu.id,
          unit,
        },
      });
    }

    res
      .status(201)
      .json({ success: true, message: "Menu Item created Successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ success: false, error: "Menu item creation failed" });
  }
};

export const getMenuItems = async (req: any, res: Response) => {
  try {
    const requestedUser = req.user;

    const data = await prisma.menuItem.findMany({
      where: { restaurantId: requestedUser.resturant.id },
      include: { unit: true, menuCategory: true },
    });
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .json({ success: false, error: "Menu item retrieval failed" });
  }
};

export const updateMenuItem = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, units } = req.body;
    req.body;
    const upperCategory = category.toUpperCase();

    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: { restaurant: true },
    });

    if (!menuItem) {
      return res
        .status(404)
        .json({ success: false, message: "Menu item not found" });
    }
    const menuItemOwnerID = menuItem?.restaurant?.userId;
    const currentUserID = req.user.id;

    if (menuItemOwnerID !== currentUserID) {
      return res.status(403).json({
        success: false,
        error: "You are not the owner of the menu item",
      });
    }
    let categoryRecord = await prisma.category.findFirst({
      where: { category: upperCategory },
    });

    if (!categoryRecord) {
      categoryRecord = await prisma.category.create({
        data: { category: upperCategory },
      });
    }

    if (units && Array.isArray(units)) {
      await prisma.unit.deleteMany({
        where: { menuItemId: id },
      });
      for (const unit of units) {
        await prisma.unit.create({
          data: {
            menuItemId: id,
            unit,
          },
        });
      }
    }

    const updated = await prisma.menuItem.update({
      where: { id },
      data: {
        name,
        description,
        price: Number(price),
        categoryId: categoryRecord.id,
      },
      include: { unit: true, menuCategory: true },
    });

    res.status(200).json({ success: true, data: updated });
  } catch (err: any) {
    return res
      .status(404)
      .json({ success: false, message: "Menu update request failed" });
  }
};

export const deleteMenuItem = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.menuItem.findUnique({
      where: { id },
      include: { restaurant: true },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Menu item not found" });
    }
    const menuItemOwner = existing.restaurant?.userId;
    const deleteRequestedUser = req.user?.id;
    if (menuItemOwner !== deleteRequestedUser) {
      return res.status(403).json({
        success: false,
        message:
          "You are not the one who created the menu so you cant delete this item",
      });
    }
    await prisma.menuItem.update({
      where: { id },
      data: { isAvailable: false },
    });
    res.status(200).json({
      success: true,
      message: "This items is made unavailable",
    });
  } catch {
    return res
      .status(404)
      .json({ success: false, message: "Menu deleation failed" });
  }
};

export const makeMenuItemAvailable = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.menuItem.findUnique({
      where: { id },
      include: { restaurant: true },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Menu item not found" });
    }

    const menuItemOwner = existing.restaurant?.userId;
    const deleteRequestedUser = req.user?.id;
    if (menuItemOwner !== deleteRequestedUser) {
      return res.status(403).json({
        success: false,
        message:
          "You are not the one who created the menu so you cannot make  this item available",
      });
    }

    await prisma.menuItem.update({
      where: { id },
      data: { isAvailable: true },
    });
    res
      .status(200)
      .json({ success: true, message: "This item  is now available " });
  } catch {
    return res
      .status(404)
      .json({ success: false, message: "Menu available request failed" });
  }
};
