import { AdminNavbar } from "../_components/adminPanel/AdminNavbar";
export const dynamic = "force-dynamic";
import { AdminFooter } from "../_components/adminPanel/AdminFooter";
import { getRestaurantData } from "@/utils/getRestaurantData";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const restaurant = await getRestaurantData();
    const hasRestaurant = !!restaurant;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <AdminNavbar hasRestaurant={hasRestaurant} />
            <main className="flex-1">
                {children}
            </main>
            <AdminFooter />
        </div>
    );
}
