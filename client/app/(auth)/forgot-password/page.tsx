"use client";

import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";

import { useRouter } from "next/navigation";

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
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Forgot your password?</h2>
          <p className="text-gray-600 mb-6">Enter your email to receive a reset link.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              disabled={loading}
              className="w-full px-4 py-2 border text-black border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded transition ${loading ? "bg-gray-400 text-gray-200 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
