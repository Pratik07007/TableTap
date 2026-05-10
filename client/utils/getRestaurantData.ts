import { cookies } from "next/headers";
import { cache } from "react";

export const getRestaurantData = cache(async () => {
  const cookieStore = await cookies();
  const cookieString = cookieStore.toString();
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/resturant/me`,
      {
        headers: {
          Cookie: cookieString,
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
