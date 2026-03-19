"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, ClipboardList, LogOut, Utensils } from "lucide-react";
import toast from "react-hot-toast";

export default function UserNavbar() {
  const router = useRouter();

  const onLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      toast.success("Logged out successfully");
      router.refresh();
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-orange-600 font-bold text-xl"
        >
          <LayoutDashboard size={22} />
          <span className="text-gray-900">
            Table<span className="text-orange-600">Tap</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <Link
            href="/my-orders"
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-orange-50"
          >
            <ClipboardList size={16} />
            <span className="hidden sm:inline">My Orders</span>
          </Link>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-red-50"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
