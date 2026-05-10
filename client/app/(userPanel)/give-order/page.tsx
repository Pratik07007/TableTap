import GiveOrderClient from "./GiveOrderClient";
export const dynamic = "force-dynamic";

async function getPublicMenu(resturantID: string | undefined) {
  if (!resturantID) return { success: false, data: [] };

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/menu-items/public/${resturantID}`,
      {
        cache: "no-store",
        credentials: "include",
      }
    );
    const data = await res.json();
    if (!res.ok) {
      console.error(`Failed to fetch menu: ${res.status}`);
      return { success: false, data: [] };
    }
    return data;
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
  const resturantID = params.rest_id;

  if (!resturantID) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4 p-4 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Invalid Restaurant</h1>
        <p className="text-gray-500">
          Please scan a valid QR code to view the menu.
        </p>
      </div>
    );
  }

  const response = await getPublicMenu(resturantID);

  return (
    <GiveOrderClient
      menuItems={response.data || []}
      resturantID={resturantID}
    />
  );
}
