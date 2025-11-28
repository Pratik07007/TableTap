import { BarChart3, QrCode, ChefHat } from "lucide-react";

export const Features = () => {
    return (
        <section id="features" className="py-24 bg-white scroll-mt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Complete Control Over Your Venue</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <FeatureCard
                        icon={BarChart3}
                        title="Revenue & Order Tracking"
                        desc="View real-time sales data, track active tables, and monitor payment statuses instantly from the owner dashboard."
                    />
                    <FeatureCard
                        icon={QrCode}
                        title="QR Dine-In Facility"
                        desc="Empower your customers to scan, order, and pay directly from the table. Reduce waiter workload by up to 40%."
                    />
                    <FeatureCard
                        icon={ChefHat}
                        title="Digital Kitchen Flow"
                        desc="Replace confusing paper tickets with digital order tracking. Reduce errors and speed up preparation times."
                    />
                </div>
            </div>
        </section>
    );
};

const FeatureCard = ({ icon: Icon, title, desc }: { icon: React.ElementType, title: string, desc: string }) => (
    <div className="bg-gray-50 p-8 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 group cursor-default">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 text-gray-900 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
            <Icon size={24} strokeWidth={2} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-500 leading-relaxed">{desc}</p>
    </div>
);