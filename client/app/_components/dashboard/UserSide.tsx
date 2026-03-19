import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import {
  MapPin,
  ChevronRight,
  Store,
  ClipboardList,
  Utensils,
} from "lucide-react";
import UserNavbar from "./UserNavbar";

type Restaurant = {
  id: string;
  name: string;
  streetAddress: string;
  city: string;
  state: string;
};

async function getAllRestaurants(): Promise<Restaurant[]> {
  try {
    const cookieStore = await cookies();
    const res = await fetch(
      `${process.env.BACKEND_URL || "http://localhost:8080"}/api/resturant/all`,
      {
        headers: { Cookie: cookieStore.toString() },
        cache: "no-store",
      }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

const UserSide = async () => {
  const restaurants = await getAllRestaurants();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-50">
      <UserNavbar />

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 pt-12 pb-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-6">
          <Utensils size={14} />
          Dine In, Delivered
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-3">
          Where would you like to{" "}
          <span className="text-orange-600">eat today?</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Browse our partnered restaurants and place your order in seconds — no
          QR code needed.
        </p>
      </div>

      {/* Restaurant List */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        {restaurants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4">
              <Store className="text-orange-400" size={36} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No restaurants yet
            </h3>
            <p className="text-gray-500 text-sm max-w-xs">
              It looks like no restaurants have registered on the platform yet.
              Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {restaurants.map((r) => (
              <Link
                key={r.id}
                href={`/give-order?rest_id=${r.id}`}
                className="group relative bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all duration-300 flex items-center gap-5 overflow-hidden"
              >
                {/* Accent blob */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-orange-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Store className="text-white" size={24} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1 truncate group-hover:text-orange-700 transition-colors">
                    {r.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                    <MapPin size={13} className="flex-shrink-0 text-orange-400" />
                    <span className="truncate">
                      {r.streetAddress}, {r.city}, {r.state}
                    </span>
                  </div>
                </div>

                <ChevronRight
                  size={20}
                  className="text-gray-300 group-hover:text-orange-500 flex-shrink-0 transition-colors duration-200 group-hover:translate-x-1 transition-transform"
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSide;
