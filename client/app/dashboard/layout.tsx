import React from 'react';

export default function Layout({
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
    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Main Dashboard Content (Header/Welcome) */}
                <div className="w-full">
                    {children}
                </div>

                {/* Premium Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
                    {/* Left Column: Long Sales Report (Today's Sales) */}
                    <div className="lg:col-span-2 h-full">
                        {todaySales}
                    </div>

                    {/* Right Column: Split Layout */}
                    <div className="lg:col-span-1 flex flex-col gap-6 h-full">
                        {/* Top Right: Restaurant Info */}
                        <div className="flex-1 min-h-0">
                            {resturantInfo}
                        </div>

                        {/* Bottom Right: Daily Sales (with Error) */}
                        <div className="flex-1 min-h-0">
                            {dailySalesReport}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
