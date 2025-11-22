import { Request, Response, NextFunction } from "express";
import prisma from "../prisma/client";
import { checkSessionAndGetUserId } from "../utils/checkSession";

const categoryMap: Record<
  string,
  | "HOT_DRINK"
  | "COLD_DRINK"
  | "ALCOHOLIC_DRINK"
  | "VEGAN_FOOD"
  | "CHINESE"
  | "NEPALI"
  | "THAI"
  | "CONTINENTAL"
> = {
  "hot drink": "HOT_DRINK",
  "cold drink": "COLD_DRINK",
  "alcoholic drink": "ALCOHOLIC_DRINK",
  "vegan food": "VEGAN_FOOD",
  chinese: "CHINESE",
  nepali: "NEPALI",
  thai: "THAI",
  continental: "CONTINENTAL",
};

const quantityMap: Record<
  string,
  "SERVING" | "HALF_SERVING" | "FULL_SERVING" | "HALF_PLATE" | "FULL_PLATE"
> = {
  serving: "SERVING",
  "half serving": "HALF_SERVING",
  "full serving": "FULL_SERVING",
  "half plate": "HALF_PLATE",
  "full plate": "FULL_PLATE",
};

export const createMenuItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = checkSessionAndGetUserId(req);
    if (!session.success) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    const restaurant = await prisma.resturants.findUnique({ where: { userId: session.userId as string } });
    if (!restaurant) {
      return res.status(400).json({ success: false, message: "No restaurant found for user" });
    }
    const body = req.body || {};
    const category = categoryMap[String(body.category || "").toLowerCase()];
    const quantityType =
      quantityMap[String(body.quantityType || "").toLowerCase()];
    if (!category || !quantityType) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category or quantityType" });
    }
    const item = await prisma.menuItem.create({
      data: {
        name: body.name,
        description: body.description || null,
        price: Number(body.price),
        category,
        quantityType,
        imageUrl: body.imageUrl || null,
        isAvailable:
          typeof body.isAvailable === "boolean" ? body.isAvailable : true,
        restaurantId: restaurant.id,
      },
    });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

export const getMenuItems = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = checkSessionAndGetUserId(_req);
    if (!session.success) {
      return res.status(200).json({ success: true, data: [] });
    }
    const restaurant = await prisma.resturants.findUnique({ where: { userId: session.userId as string } });
    if (!restaurant) {
      return res.status(200).json({ success: true, data: [] });
    }
    const items = await prisma.menuItem.findMany({ where: { restaurantId: restaurant.id } });
    res.status(200).json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

export const updateMenuItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = checkSessionAndGetUserId(req);
    if (!session.success) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    const restaurant = await prisma.resturants.findUnique({ where: { userId: session.userId as string } });
    if (!restaurant) {
      return res.status(400).json({ success: false, message: "No restaurant found for user" });
    }
    const { id } = req.params;
    const body = req.body || {};
    const data: any = {};
    if (typeof body.name !== "undefined") data.name = body.name;
    if (typeof body.description !== "undefined")
      data.description = body.description || null;
    if (typeof body.price !== "undefined") data.price = Number(body.price);
    if (typeof body.category !== "undefined") {
      const category = categoryMap[String(body.category || "").toLowerCase()];
      if (!category)
        return res
          .status(400)
          .json({ success: false, message: "Invalid category" });
      data.category = category;
    }
    if (typeof body.quantityType !== "undefined") {
      const qt = quantityMap[String(body.quantityType || "").toLowerCase()];
      if (!qt)
        return res
          .status(400)
          .json({ success: false, message: "Invalid quantityType" });
      data.quantityType = qt;
    }
    if (typeof body.imageUrl !== "undefined")
      data.imageUrl = body.imageUrl || null;
    if (typeof body.isAvailable !== "undefined")
      data.isAvailable = !!body.isAvailable;
    const existing = await prisma.menuItem.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Menu item not found" });
    }
    if (existing.restaurantId !== restaurant.id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const updated = await prisma.menuItem.update({ where: { id }, data });
    res.status(200).json({ success: true, data: updated });
  } catch (err: any) {
    if (err?.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Menu item not found" });
    }
    next(err);
  }
};

export const deleteMenuItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = checkSessionAndGetUserId(req);
    if (!session.success) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    const restaurant = await prisma.resturants.findUnique({ where: { userId: session.userId as string } });
    if (!restaurant) {
      return res.status(400).json({ success: false, message: "No restaurant found for user" });
    }
    const { id } = req.params;
    const existing = await prisma.menuItem.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Menu item not found" });
    }
    if (existing.restaurantId !== restaurant.id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const updated = await prisma.menuItem.update({ where: { id }, data: { isAvailable: false } });
    res.status(200).json({ success: true, data: updated });
  } catch (err: any) {
    if (err?.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Menu item not found" });
    }
    next(err);
  }
};

export const makeMenuItemAvailable = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = checkSessionAndGetUserId(req);
    if (!session.success) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    const restaurant = await prisma.resturants.findUnique({ where: { userId: session.userId as string } });
    if (!restaurant) {
      return res.status(400).json({ success: false, message: "No restaurant found for user" });
    }
    const { id } = req.params;
    const existing = await prisma.menuItem.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Menu item not found" });
    }
    if (existing.restaurantId !== restaurant.id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const updated = await prisma.menuItem.update({ where: { id }, data: { isAvailable: true } });
    res.status(200).json({ success: true, data: updated });
  } catch (err: any) {
    if (err?.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Menu item not found" });
    }
    next(err);
  }
};
