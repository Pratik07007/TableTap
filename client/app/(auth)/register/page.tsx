"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { z } from "zod";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard } from "lucide-react";

const registerSchema = z.object({
    fName: z.string().min(1, "First name is required"),
    lName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z.enum(["ADMIN", "USER"]),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

function RegisterContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role_url = searchParams.get("role");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const rawData = {
            fName: formData.get("fName") as string,
            lName: formData.get("lName") as string,
            email: formData.get("email") as string,
            password: formData.get("password") as string,
            confirmPassword: formData.get("confirmPassword") as string,
            role: role_url
        };

        const parsed = registerSchema.safeParse(rawData);
        if (!parsed.success) {
            parsed.error.issues.forEach((err) => {
                toast.error(err.message);
            });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...parsed.data, role: role_url }),
            });
            const data = await response.json();
            if (!data.success) {
                toast.error(data.message);
            } else {
                toast.success(data.message);
                setTimeout(() => {
                    router.push("/login");
                }, 2000);
            }
        } catch (err) {
            console.log("Error in register/page.tsx", err);
            toast.error("Network error");
        } finally {
            setLoading(false);
        }
    };

    if (role_url !== "ADMIN" && role_url !== "USER") {
        return (
            <div className="min-h-screen flex">
                <div className="w-full md:w-1/2 flex items-center justify-center bg-white">
                    <div className="w-full max-w-md px-8 text-center">
                        <div className="mx-auto w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Invalid Access
                        </h2>
                        <p className="text-gray-500 mb-8">
                            The registration link is invalid or broken.
                        </p>
                        <Link href="/" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-orange-600 hover:bg-orange-700 transition-colors">
                            Return Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Suspense fallback={<div />}> 
        <div className="min-h-screen flex bg-white">
            {/* Left half: image & Branding */}
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

            {/* Right half: form */}
            <div className="w-full md:w-1/2 flex items-center justify-center bg-white">
                <div className="w-full max-w-md px-8 py-12">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            {role_url === "ADMIN" ? "Create Admin Account" : "Create User Account"}
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Enter your details below to get started with TableTap.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <input
                                    name="fName"
                                    type="text"
                                    placeholder="First Name"
                                    required
                                    disabled={loading}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <input
                                    name="lName"
                                    type="text"
                                    placeholder="Last Name"
                                    required
                                    disabled={loading}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

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

                        <div className="relative">
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                required
                                disabled={loading}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        <div className="relative">
                            <input
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                required
                                disabled={loading}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={loading}
                                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
                            >
                                {showConfirmPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3.5 rounded-full font-bold shadow-lg transition-all transform hover:-translate-y-0.5 ${loading
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                                : "bg-orange-600 text-white hover:bg-orange-700 shadow-orange-600/20"
                                }`}
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>

                        <p className="text-center text-sm text-gray-600 mt-6">
                            Already have an account?{" "}
                            <Link href="/login" className="font-semibold text-orange-600 hover:text-orange-700 transition-colors hover:underline">
                                Log in here
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
        </Suspense>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div />}> 
            <RegisterContent />
        </Suspense>
    );
}