import { prisma } from '../../prisma/client';

export const getMenusService = async (resturantID: string) => {
  try {
    const data = await prisma.menuItem.findMany({
      where: { resturantID },
      include: {
        menuCategory: true,
        unit: true,
      },
    });

    return { success: true, data, code: 200 };
  } catch (err) {
    return { success: false, error: 'Menu item retrieval failed', code: 400 };
  }
};

export const createMenuService = async (resturantID: string, data: { name: string; description: string; category: string; imageUrl: string; isAvailable: boolean; units: { unit: string; price: number }[] }) => {
  try {
    const { name, description, category, imageUrl, isAvailable, units } = data;
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
        imageUrl,
        isAvailable,
        resturantID: resturantID,
        categoryId: categoryRecord.id,
      },
    });

    await prisma.unit.createMany({
      data: units.map((unit) => ({
        unit: unit.unit,
        price: unit.price,
        menuItemId: menu.id,
      })),
    });

    return {
      success: true,
      message: 'Menu Item created Successfully',
      code: 201,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Menu item creation failed',
      code: 400,
    };
  }
};

export const getPublicMenusService = async (resturantID: string) => {
  try {
    const data = await prisma.menuItem.findMany({
      where: {
        resturantID,
        isAvailable: true,
      },
      include: { unit: true, menuCategory: true },
    });

    return { success: true, data, code: 200 };
  } catch (err) {
    console.log(err);
    return { success: false, error: 'Public menu item retrieval failed', code: 400 };
  }
};

export const getMenuService = async (id: string, currentresturantID: string) => {
  try {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: { unit: true, menuCategory: true },
    });

    if (!menuItem) {
      return { success: false, message: 'Menu item not found', code: 404 };
    }

    const menuItemOwnerID = menuItem.resturantID;

    if (menuItemOwnerID !== currentresturantID) {
      return {
        success: false,
        error: 'You are not the owner of the menu item',
        code: 403,
      };
    }

    return { success: true, data: menuItem, code: 200 };
  } catch (err) {
    console.log(err);
    return { success: false, error: 'Menu item retrieval failed', code: 400 };
  }
};

export const updateMenuService = async (id: string, userId: string, data: { name: string; description: string; category: string; units: { unit: string; price: number }[]; imageUrl?: string }) => {
  try {
    const { name, description, category, units } = data;
    const upperCategory = category.toUpperCase();

    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: { restaurant: true },
    });

    if (!menuItem) {
      return { success: false, message: 'Menu item not found', code: 404 };
    }
    const menuItemOwnerID = menuItem?.restaurant?.userId;

    if (menuItemOwnerID !== userId) {
      return {
        success: false,
        error: 'You are not the owner of the menu item',
        code: 403,
      };
    }

    let categoryRecord = await prisma.category.findFirst({
      where: { category: upperCategory },
    });

    if (!categoryRecord) {
      categoryRecord = await prisma.category.create({
        data: { category: upperCategory },
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.menuItem.update({
        where: { id },
        data: {
          name,
          description,
          categoryId: categoryRecord.id,
          imageUrl: data.imageUrl,
        },
      });

      await tx.unit.deleteMany({
        where: { menuItemId: id },
      });

      if (units && units.length > 0) {
        await tx.unit.createMany({
          data: units.map((unit) => ({
            unit: unit.unit,
            price: unit.price,
            menuItemId: id,
          })),
        });
      }

      // Return the fully updated item
      return tx.menuItem.findUnique({
        where: { id },
        include: { unit: true, menuCategory: true },
      });
    });

    return { success: true, data: updated, code: 200 };
  } catch (err: any) {
    return { success: false, message: 'Menu update request failed', code: 404 };
  }
};

export const deleteMenuService = async (id: string, userId: string) => {
  try {
    const existing = await prisma.menuItem.findUnique({
      where: { id },
      include: { restaurant: true },
    });

    if (!existing) {
      return { success: false, message: 'Menu item not found', code: 404 };
    }
    const menuItemOwner = existing.restaurant?.userId;

    if (menuItemOwner !== userId) {
      return {
        success: false,
        message: 'You are not the one who created the menu so you cant delete this item',
        code: 403,
      };
    }
    await prisma.menuItem.update({
      where: { id },
      data: { isAvailable: false },
    });
    return {
      success: true,
      message: 'This items is made unavailable',
      code: 200,
    };
  } catch {
    return { success: false, message: 'Menu deleation failed', code: 404 };
  }
};

export const getCategoryService = async () => {
  try {
    const categories = await prisma.category.findMany({
      distinct: ['category'],
    });
    return { success: true, data: categories, code: 200 };
  } catch (err: any) {
    return { success: false, message: 'Category retrieval failed', code: 400 };
  }
};

export const getUnitsService = async () => {
  try {
    const units = await prisma.unit.findMany({
      distinct: ['unit'],
    });
    return { success: true, data: units, code: 200 };
  } catch (err: any) {
    return { success: false, message: 'Unit retrieval failed', err, code: 400 };
  }
};

export const makeMenuAvailableService = async (id: string, userId: string) => {
  try {
    const existing = await prisma.menuItem.findUnique({
      where: { id },
      include: { restaurant: true },
    });

    if (!existing) {
      return { success: false, message: 'Menu item not found', code: 404 };
    }

    const menuItemOwner = existing.restaurant?.userId;

    if (menuItemOwner !== userId) {
      return {
        success: false,
        message: 'You are not the one who created the menu so you cannot make  this item available',
        code: 403,
      };
    }

    await prisma.menuItem.update({
      where: { id },
      data: { isAvailable: true },
    });
    return { success: true, message: 'This item  is now available ', code: 200 };
  } catch {
    return { success: false, message: 'Menu available request failed', code: 404 };
  }
};
