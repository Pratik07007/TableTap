"use client";


import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react"; // Matches the branding icon

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (data?.success) {
        toast.success(data.message);
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        const raw: unknown = data.message as unknown;
        let msg: unknown = raw;
        if (Array.isArray(raw)) {
          msg = (raw[0] as { message?: string })?.message ?? raw[0];
        } else if (typeof raw === "object" && raw && "errors" in (raw as Record<string, unknown>)) {
          const errs = (raw as { errors?: { message?: string }[] }).errors;
          msg = errs && errs[0]?.message;
        }
        toast.error(typeof msg === "string" ? msg : "Login failed");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left half: Image & Branding */}
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

      {/* Right half: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white">
        <div className="w-full max-w-md px-8 py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500 text-sm">
              Please enter your details to sign in.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <input
                name="password"
                type="password"
                placeholder="Password"
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <div className="text-right mt-2">
                <a href="/forgot-password" className="text-sm font-medium text-gray-500 hover:text-orange-600 transition-colors">
                  Forgot Password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-full font-bold shadow-lg transition-all transform hover:-translate-y-0.5 ${loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                : "bg-orange-600 text-white hover:bg-orange-700 shadow-orange-600/20"
                }`}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <p className="text-center text-sm text-gray-600 mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/register?role=ADMIN" className="font-semibold text-orange-600 hover:text-orange-700 transition-colors hover:underline">
                Create one here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}