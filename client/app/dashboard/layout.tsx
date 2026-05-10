import React from 'react';
export const dynamic = "force-dynamic";
import { AdminNavbar } from "../_components/adminPanel/AdminNavbar";
import { AdminFooter } from "../_components/adminPanel/AdminFooter";
import { getUserIDandRoleFromToken } from "@/utils/getUserIdandRoleFromToken";
import { getRestaurantData } from "@/utils/getRestaurantData";

export default async function Layout({
    children,
    dailySalesReport,
    todaySales,
    resturantInfo
}: {
    children: React.ReactNode
    resturantInfo: React.ReactNode
    dailySalesReport: React.ReactNode,
    todaySales: React.ReactNode
}) {
    const { role } = await getUserIDandRoleFromToken();

    if (role !== 'ADMIN') {
        return <>{children}</>;
    }

    const restaurant = await getRestaurantData();
    const hasRestaurant = !!restaurant;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <AdminNavbar hasRestaurant={hasRestaurant} />
            <div className="flex-1 p-6 md:p-8">
                <div className="max-w-7xl mx-auto h-full">
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start h-full">
                        <div className="xl:col-span-3 w-full">
                            {children}
                        </div>
                        <div className="xl:col-span-1 w-full">
                            {resturantInfo}
                        </div>
                    </div>
                </div>
            </div>
            <AdminFooter />
        </div>
    )
}
