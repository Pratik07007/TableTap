"use client";
import {
  LayoutDashboard,
  LogOut,
  Utensils,
  Home,
  Store,
  ShoppingBag,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState } from "react";
// Removed broken import of UpdateResturantModal

export const AdminNavbar = () => {
  const router = useRouter();

  const [restaurantData, setRestaurantData] = useState<any>(null); // Using any for simplicity here, ideally strict type

  const onLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (confirmed) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
          method: "POST",
          credentials: "include",
        });
        toast.success("Logged out successfully");
        router.refresh();
      } catch {
        console.log("Error logging out");
        toast.error("Logout failed");
      }
    }
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-orange-600"
              >
                <LayoutDashboard className="h-8 w-8" />
                <span className="text-2xl font-bold text-gray-900">
                  Table<span className="text-orange-600">Tap</span>
                </span>
              </Link>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                >
                  <Home size={18} /> Dashboard
                </Link>
                <Link
                  href="/menu"
                  className="text-gray-600 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                >
                  <Utensils size={18} /> Menu
                </Link>
                <Link
                  href="/take-orders"
                  className="text-gray-600 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                >
                  <ShoppingBag size={18} /> Take Orders
                </Link>
                <Link
                  href="/orders-details"
                  className="text-gray-600 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                >
                  <ClipboardList size={18} /> Orders
                </Link>
                <Link
                  href="/billing"
                  className="text-gray-600 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                >
                  <Store size={18} /> Bills
                </Link>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};
