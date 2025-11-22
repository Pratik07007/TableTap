"use client";

import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        toast.error(data.message || "Failed to send reset link");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side: Branding */}
      <div className="hidden md:flex md:w-1/2 bg-linear-to-br from-orange-600 to-amber-200 items-center justify-center relative overflow-hidden">

        <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent"></div>

        <div className="relative z-10 text-center px-8">
          <div className="flex items-center justify-center gap-3 text-white mb-4">
            <LayoutDashboard className="h-10 w-10" />
            <span className="text-4xl font-bold tracking-tighter">
              Table<span className="text-orange-200">Tap</span>
            </span>
          </div>
          <p className="text-orange-100 text-lg font-light max-w-md mx-auto">
            Join thousands of restaurant owners streamlining their operations today.
          </p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white">
        <div className="w-full max-w-md px-8 py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
            <p className="text-gray-500 text-sm">
              Enter your registered email address to receive a reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-full font-bold shadow-lg transition-all transform hover:-translate-y-0.5 ${loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                : "bg-orange-600 text-white hover:bg-orange-700 shadow-orange-600/20"
                }`}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="text-center mt-4">
              <Link href="/login" className="text-sm text-gray-500 hover:text-orange-600 transition-colors flex items-center justify-center gap-1">
                ← Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div >
  );
}