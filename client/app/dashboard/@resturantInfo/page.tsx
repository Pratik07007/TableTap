import { Store, MapPin, Phone, Mail, Clock } from 'lucide-react';

export default async function Page() {
    // 5 second delay as requested
    await new Promise(resolve => setTimeout(resolve, 5000));

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Store className="text-orange-600" size={20} />
                    Restaurant Info
                </h2>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide">
                    Open Now
                </span>
            </div>

            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                        <MapPin size={18} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">123 Culinary Avenue</p>
                        <p className="text-xs text-gray-500">Food District, FD 9988</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                        <Phone size={18} />
                    </div>
                    <p className="text-sm font-medium text-gray-900">+1 (555) 123-4567</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                        <Mail size={18} />
                    </div>
                    <p className="text-sm font-medium text-gray-900">contact@tabletap.com</p>
                </div>

                <div className="pt-4 border-t border-gray-100 mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <Clock size={12} /> Last updated:
                        </span>
                        <span className="font-medium">Just now</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
