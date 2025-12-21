
import { cookies } from "next/headers";
import OrdersClient from "./OrdersClient";

async function getOrders(page: string, email: string | undefined) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const queryParams = new URLSearchParams();
    queryParams.set("page", page);
    if (email) queryParams.set("email", email);
    queryParams.set("limit", "10");

    const apiUrl = `${process.env.BACKEND_URL || "http://localhost:8080"}/api/orders?${queryParams.toString()}`;
    
    // Server-side fetch needs absolute URL
    const res = await fetch(apiUrl, {
      headers: {
        Cookie: `token=${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store", // SSR: Always fetch fresh data
    });

    if (!res.ok) {
      console.error(`Failed to fetch orders: ${res.status} ${res.statusText}`);
      // Return empty structure on error to prevent page crash
      return { 
          success: false, 
          data: [], 
          pagination: { totalOrders: 0, totalPages: 1, currentPage: 1, limit: 10 } 
      };
    }

    return await res.json();
  } catch (error) {
    console.error("Fetch error:", error);
     return { 
          success: false, 
          data: [], 
          pagination: { totalOrders: 0, totalPages: 1, currentPage: 1, limit: 10 } 
      };
  }
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; email?: string }>;
}) {
  const params = await searchParams;
  const page = params.page || "1";
  const email = params.email;

  const response = await getOrders(page, email);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <OrdersClient 
        initialOrders={response.data || []} 
        pagination={response.pagination || { totalOrders: 0, totalPages: 1, currentPage: 1, limit: 10 }} 
      />
    </div>
  );
}
