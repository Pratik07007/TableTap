"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QrCode, LayoutDashboard, Loader2, User, Smartphone, ArrowRight } from "lucide-react";
import Link from "next/link";

// Define the shape of your session data
interface UserSession {
    email: string;
    role: "ADMIN" | "USER";
    name: string;
    // Add other fields if your JWT includes them
}

interface Restaurant {
    id: string;
    name: string;
    streetAddress: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
    email: string;
    faceBookUrl?: string | null;
    tikTokUrl?: string | null;
    instagramUrl?: string | null;
}

function DashBoard() {
    const router = useRouter();
    const [userData, setUserData] = useState<UserSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

    useEffect(() => {
        const verifyUser = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/validate-session`, {
                    method: 'GET',
                    credentials: 'include',
                });
                const session = await response.json();
                if (!response.ok || !session.success) {
                    router.push('/login');
                    return;
                }
                const data = {
                    email: session.data.email,
                    role: session.data.role,
                    name: session.data.name,
                } as UserSession;
                setUserData(data);
                if (data.role === "ADMIN") {
                    try {
                        const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resturant/me`, { method: 'GET', credentials: 'include' });
                        const rjson = await r.json();
                        if (r.ok && rjson.success && rjson.data) {
                            setRestaurant(rjson.data as Restaurant);
                        }
                    } catch { }
                }
            } catch {
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };
        verifyUser();
    }, [router]);

    // --- Loading State ---
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                        <Loader2 className="animate-spin" size={24} />
                    </div>
                    <p className="text-gray-500 font-medium">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    if (!userData) return null;

    // --- USER VIEW (Customer) ---
    if (userData.role === "USER") {
        return (
            <div className="min-h-screen bg-white">
                {/* Simple Header */}
                <nav className="border-b border-gray-100 py-4 px-6 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-gray-900 font-bold text-xl">
                        <QrCode className="text-orange-600" /> TableTap
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User size={16} /> {userData.name}
                    </div>
                </nav>

                {/* Main Content */}
                <div className="max-w-md mx-auto px-6 pt-20 text-center">
                    <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-500">
                        <Smartphone className="text-orange-600 h-12 w-12" strokeWidth={1.5} />
                    </div>

                    <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
                        Hungry, {userData.name.split(' ')[0]}?
                    </h1>

                    <p className="text-gray-500 text-lg mb-10 leading-relaxed">
                        To place an order, please look for the <span className="font-bold text-gray-900">QR Code</span> on your restaurant table and scan it with your camera.
                    </p>

                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-left space-y-4">
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-sm text-gray-900 shrink-0">1</div>
                            <div>
                                <h3 className="font-bold text-gray-900">Locate QR Code</h3>
                                <p className="text-sm text-gray-500">Find the standee or sticker on your table.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-sm text-gray-900 shrink-0">2</div>
                            <div>
                                <h3 className="font-bold text-gray-900">Scan & Order</h3>
                                <p className="text-sm text-gray-500">Use your phone camera. The menu will pop up instantly.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-sm text-gray-900 shrink-0">3</div>
                            <div>
                                <h3 className="font-bold text-gray-900">Enjoy</h3>
                                <p className="text-sm text-gray-500">We&apos;ll bring the food right to your seat.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- ADMIN VIEW (Restaurant Owner) ---
    if (userData.role === "ADMIN") {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-orange-600 rounded-xl text-white">
                                <LayoutDashboard size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                                <p className="text-gray-500 text-sm">Overview</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/" className="text-sm text-gray-500 hover:text-orange-600">Back to Home</Link>
                        </div>
                    </div>

                    {/* Admin Details Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-4">
                            Account Information
                        </h2>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Admin Name</p>
                                    <p className="text-lg font-medium text-gray-900">{userData.name}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Email Address</p>
                                    <p className="text-lg font-medium text-gray-900">{userData.email}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Account Status</p>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                                        Active
                                    </span>
                                </div>
                            </div>

                            {restaurant && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Restaurant Name</p>
                                        <p className="text-lg font-medium text-gray-900">{restaurant.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Street Address</p>
                                        <p className="text-lg font-medium text-gray-900">{restaurant.streetAddress}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">City</p>
                                        <p className="text-lg font-medium text-gray-900">{restaurant.city}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">State</p>
                                        <p className="text-lg font-medium text-gray-900">{restaurant.state}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">ZIP</p>
                                        <p className="text-lg font-medium text-gray-900">{restaurant.zip}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Country</p>
                                        <p className="text-lg font-medium text-gray-900">{restaurant.country}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Phone</p>
                                        <p className="text-lg font-medium text-gray-900">{restaurant.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Restaurant Email</p>
                                        <p className="text-lg font-medium text-gray-900">{restaurant.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Instagram URL</p>
                                        <p className="text-lg font-medium text-gray-900">{restaurant.instagramUrl}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Facebook URL</p>
                                        <p className="text-lg font-medium text-gray-900">{restaurant.faceBookUrl}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">TikTok URL</p>
                                        <p className="text-lg font-medium text-gray-900">{restaurant.tikTokUrl}</p>
                                    </div>

                                </div>
                            )}
                        </div>

                        <div className="mt-10 pt-6 border-t border-gray-100 flex gap-4">
                            <Link href={restaurant ? "/update-restaurant" : "/register-restaurant"} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center gap-2">
                                {restaurant ? 'Update Restaurant Information' : 'Manage Restaurant'} <ArrowRight size={16} />
                            </Link>
                            <Link href="/menu" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                                Manage Menu <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Fallback
    return <div>Dashboard</div>;
}

export default DashBoard;