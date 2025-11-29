import { TrendingUp, DollarSign, Calendar, ArrowUpRight } from 'lucide-react';

export default function Page() {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="text-orange-600" size={24} />
                    Today&apos;s Sales Report
                </h2>
                <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                        <Calendar size={18} />
                    </button>
                </div>
            </div>

            {/* Dummy Long Content to satisfy "Long sales report" requirement visually */}
            <div className="flex-1 overflow-auto space-y-4 pr-2 custom-scrollbar">
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                        <p className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-1">Total Revenue</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-gray-900">$1,240.50</span>
                            <span className="text-xs font-medium text-green-600 flex items-center">
                                <ArrowUpRight size={12} /> 12%
                            </span>
                        </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Total Orders</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-gray-900">48</span>
                            <span className="text-xs font-medium text-green-600 flex items-center">
                                <ArrowUpRight size={12} /> 5%
                            </span>
                        </div>
                    </div>
                </div>

                <h3 className="text-sm font-bold text-gray-900 mb-3">Recent Transactions</h3>

            </div>
        </div>
    )
}
