"use client";

import Image from "next/image";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
      toast.error("Token not found");
      return;
    }
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const data = await res.json();
      if (data.success) {

        toast.success(data.message);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        toast.error(data.message || "Reset failed");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex md:w-1/2 from-indigo-500 to-purple-600 items-center justify-center relative">
        <Image
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop"
          alt="Restaurant interior"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          width={1000}
          height={1000}
        />
        <div className="relative text-white text-4xl font-bold z-10">TableTap</div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md px-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Reset your password</h2>
          {!token && (
            <p className="text-red-500 mb-4">Token not found. Please use the link sent to your email.</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                required
                disabled={loading}
                className="w-full px-4 py-2 border text-black border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={loading} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600 disabled:opacity-50">
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                required
                disabled={loading}
                className="w-full px-4 py-2 border text-black border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={loading} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600 disabled:opacity-50">
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded transition ${loading ? "bg-gray-400 text-gray-200 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
