"use client";
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        toast.error(data.message || "Failed to send reset link");
      }
    } catch (err) {
      console.log("Error from forgot-password", err)
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (


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
            className={`w-full py-3.5 rounded-full font-bold shadow-lg transition-all transform hover:-translate-y-0.5 ${loading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
              : "bg-orange-600 text-white hover:bg-orange-700 shadow-orange-600/20"
              }`}
          >
            {loading ? "Requesting..." : "Send Request"}
          </button>
        </form>
      </div>
    </div>

  );
}
