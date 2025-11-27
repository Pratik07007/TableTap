import { prisma } from "../prisma/client";

export const createResturantService = async (
  userId: string,
  name: string,
  address: string,
  city: string,
  state: string,
  country: string,
  zipCode: string,
  phoneNumber: string,
  email: string,
  faceBookUrl: string,
  tikTokUrl: string,
  instagramUrl: string
) => {
  try {
    const ifUserAlreadyHasResturant = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        resurant: true,
      },
    });
    if (ifUserAlreadyHasResturant?.resurant) {
      return {
        message: "User already has a resturant",
        success: false,
      };
    }
    const resturant = await prisma.resturants.create({
      data: {
        name,
        streetAddress: address,
        city,
        state,
        zip: zipCode,
        country,
        phone: phoneNumber,
        email,
        faceBookUrl,
        tikTokUrl,
        instagramUrl,
        owner: { connect: { id: userId } },
      },
    });
    await prisma.user.update({
      where: { id: userId },
      data: { resurant: { connect: { id: resturant.id } } },
    });
    return {
      message: "Resturant created successfully",
      success: true,
      data: { resturant },
    };
  } catch (error) {
    return {
      message: "Resturant creation failed",
      success: false,
      error,
    };
  }
};

export const updateResturantService = async (
  userId: string,
  name: string,
  address: string,
  city: string,
  state: string,
  country: string,
  zipCode: string,
  phoneNumber: string,
  email: string,
  faceBookUrl: string,
  tikTokUrl: string,
  instagramUrl: string
) => {
  try {
    const existing = await prisma.resturants.findUnique({ where: { userId } });
    if (!existing) {
      return {
        message: "No restaurant exists for this user",
        success: false,
      };
    }
    const updated = await prisma.resturants.update({
      where: { userId },
      data: {
        name,
        streetAddress: address,
        city,
        state,
        zip: zipCode,
        country,
        phone: phoneNumber,
        email,
        faceBookUrl,
        tikTokUrl,
        instagramUrl,
      },
    });
    return {
      message: "Resturant updated successfully",
      success: true,
      data: { resturant: updated },
    };
  } catch (error) {
    return {
      message: "Resturant update failed",
      success: false,
      error,
    };
  }
};
