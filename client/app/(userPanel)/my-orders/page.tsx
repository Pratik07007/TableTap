import { cookies } from "next/headers";
import MyOrdersClient from "./MyOrdersClient";

async function getMyOrders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  try {
    const apiUrl = `${
      process.env.BACKEND_URL || "http://localhost:8080"
    }/api/orders/my-orders?limit=20`;

    const res = await fetch(apiUrl, {
      headers: {
        Cookie: `token=${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch my orders", res.status);
      return { success: false, data: [] };
    }

    return await res.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return { success: false, data: [] };
  }
}

export default async function MyOrdersPage() {
  const response = await getMyOrders();

  return <MyOrdersClient initialOrders={response.data || []} />;
}
