import { cookies } from "next/headers";
import GiveOrderClient from "./GiveOrderClient";
import { redirect } from "next/navigation";

async function getPublicMenu(restaurantId: string | undefined) {
  if (!restaurantId) return { success: false, data: [] };

  try {
    const apiUrl = `${
      process.env.BACKEND_URL || "http://localhost:8080"
    }/api/menu/public/${restaurantId}`;
    const res = await fetch(apiUrl, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`Failed to fetch menu: ${res.status}`);
      return { success: false, data: [] };
    }
    return await res.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return { success: false, data: [] };
  }
}

export default async function GiveOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ rest_id?: string }>;
}) {
  const params = await searchParams;
  const restaurantId = params.rest_id;

  if (!restaurantId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4 p-4 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Invalid Restaurant</h1>
        <p className="text-gray-500">
          Please scan a valid QR code to view the menu.
        </p>
      </div>
    );
  }

  const response = await getPublicMenu(restaurantId);

  return (
    <GiveOrderClient
      menuItems={response.data || []}
      restaurantId={restaurantId}
    />
  );
}
