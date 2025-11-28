import { LayoutDashboard, ArrowRight } from "lucide-react";
import Link from "next/link";

export const Hero = ({ isLoggedIn }: { isLoggedIn: boolean }) => {

    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wide mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </span>
                        Restaurant Management System
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-[1.1]">
                        Master Your Service.<br />
                        <span className=" bg-clip-text text-amber-500">
                            Automate Your Orders.
                        </span>
                    </h1>

                    <p className="text-xl text-gray-500 mb-10 leading-relaxed max-w-2xl mx-auto font-light">
                        The all-in-one platform for restaurant owners. Monitor revenue in real-time, eliminate waiter errors, and provide a seamless QR dine-in experience for your customers.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        {isLoggedIn ? (
                            <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 rounded-full bg-orange-600 text-white font-bold hover:bg-orange-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-orange-600/20">
                                <LayoutDashboard size={20} /> Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/register?role=ADMIN"
                                    className="w-full sm:w-auto px-8 py-4 rounded-full bg-orange-600 text-white font-bold hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 flex items-center justify-center gap-2"
                                >
                                    Get Started <ArrowRight size={18} />
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-40 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full  from-orange-100/50 to-transparent blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full  from-gray-100 to-transparent blur-3xl -translate-x-1/2 translate-y-1/2"></div>
            </div>
        </section>
    );
};