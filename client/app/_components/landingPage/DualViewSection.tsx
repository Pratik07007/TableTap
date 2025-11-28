import { Receipt, Clock, CheckCircle2 } from "lucide-react";

export const DualViewSection = async () => {
    return (
        <section id="benefits" className="py-24 bg-white border-t border-gray-100 scroll-mt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    {/* Visual: The Solution in Action */}
                    <div className="relative">
                        <div className="absolute inset-0  from-orange-100 to-transparent rounded-3xl transform rotate-3"></div>
                        <div className="relative bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
                            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                                <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-md tracking-wide">LIVE ORDER</span>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Receipt className="text-gray-400" size={20} />
                                        <span className="text-sm text-gray-600">Order #1299</span>
                                    </div>
                                    <span className="text-sm font-bold text-green-600">Paid ($24.00)</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-100">
                                    <div className="flex items-center gap-3">
                                        <Clock className="text-orange-400" size={20} />
                                        <span className="text-sm text-gray-900 font-medium">Order #1300 (Pending)</span>
                                    </div>
                                    <span className="text-sm font-bold text-orange-600">$32.50</span>
                                </div>
                                <div className="pt-4 text-center">
                                    <div className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl text-sm font-bold">
                                        Display of Orders and Payment History
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Owner Side Text */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Solve the &quot;Busy Waiter&quot; Problem</h2>
                            <p className="text-gray-500 leading-relaxed">
                                Manual order taking is slow, confusing, and frustrating for customers. TableTap automates the process, allowing your staff to focus on hospitality while the system handles the logistics.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {[
                                "Accept individual ordering even in group settings",
                                "Secure Payment Gateway Integration",
                                "Real-time Admin Dashboard for Sales",
                                "Customizable Menu & Pricing"
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-3 group">
                                    <div className="mt-1 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                        <CheckCircle2 size={12} strokeWidth={3} />
                                    </div>
                                    <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};