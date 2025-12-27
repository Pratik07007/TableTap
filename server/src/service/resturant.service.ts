import { prisma } from '../../prisma/client';

export const createResturantService = async (userId: string, name: string, address: string, city: string, state: string, country: string, zipCode: string, phoneNumber: string, email: string, faceBookUrl: string, tikTokUrl: string, instagramUrl: string) => {
  try {
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
        userId,
      },
    });
    return {
      code: 200,
      message: 'Resturant created successfully',
      success: true,
      data: { resturant },
    };
  } catch (e) {
    return {
      code: 500,
      error: 'Resturant creation failed',
      success: false,
    };
  }
};

export const updateResturantService = async (userId: string, name: string, address: string, city: string, state: string, country: string, zipCode: string, phoneNumber: string, email: string, faceBookUrl: string, tikTokUrl: string, instagramUrl: string) => {
  try {
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
      code: 200,
      message: 'Resturant updated successfully',
      success: true,
      data: { resturant: updated },
    };
  } catch (error) {
    return {
      code: 500,
      error: 'Resturant update failed',
      success: false,
    };
  }
};
