import React from 'react';
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
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="w-full">
                        {children}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
                        <div className="lg:col-span-2 h-full">
                            {todaySales}
                        </div>

                        <div className="lg:col-span-1 flex flex-col gap-6 h-full">
                            <div className="flex-1 min-h-0">
                                {resturantInfo}
                            </div>

                            <div className="flex-1 min-h-0">
                                {dailySalesReport}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <AdminFooter />
        </div>
    )
}
