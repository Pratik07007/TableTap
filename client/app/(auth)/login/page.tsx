"use client";

import { useSearchParams } from "next/navigation";
import Image from "next/image";



export default function Page() {
    const searchParams = useSearchParams();
    const role = searchParams.get("role");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            hash: formData.get("password") as string,
            ...(role === "ADMIN" && { adminKey: formData.get("adminKey") as string }),
        };
        console.log("Registering", data);
    };

    return (
        <div className="min-h-screen flex">
            {/* Left half: image */}
            <div className="hidden md:flex md:w-1/2  from-indigo-500 to-purple-600 items-center justify-center relative">
                <Image
                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop"
                    alt="Restaurant interior"
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                    width={1000}
                    height={1000}
                />
                <div className="relative text-white text-4xl font-bold z-10">TableTap</div>
            </div>

            {/* Right half: form */}
            <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50">
                <div className="w-full max-w-md px-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                        {role === "ADMIN" ? "Admin Registration" : "User Registration"}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            name="name"
                            type="text"
                            placeholder="Full Name"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                            name="email"
                            type="email"
                            placeholder="Email"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                            name="password"
                            type="password"
                            placeholder="Password"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />

                        {role === "ADMIN" && (
                            <input
                                name="adminKey"
                                type="text"
                                placeholder="Admin Key"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        )}

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
                        >
                            Register
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
