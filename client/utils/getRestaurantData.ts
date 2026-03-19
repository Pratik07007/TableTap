import { cookies } from "next/headers";
import { cache } from "react";

export const getRestaurantData = cache(async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/resturant/me`,
      {
        headers: {
          Cookie: (await cookies()).toString(),
        },
        cache: "no-cache",
      }
    );

    if (!response.ok) return null;
    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error("Error fetching restaurant data:", error);
    return null;
  }
});
