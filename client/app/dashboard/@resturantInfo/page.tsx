import { Store, MapPin, Phone, Mail, Clock, Settings } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";

async function getRestaurantData() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/resturant/me`,
    {
      headers: {
        Cookie: (await cookies()).toString(),
      },
      cache: "no-cache",
    }
  );

  if (!response.ok) return null;
  const result = await response.json();
  return result.success ? result.data : null;
}

export default async function Page() {
  const restaurant = await getRestaurantData();

  if (!restaurant) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
          <Store className="text-orange-600" size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          No Restaurant Found
        </h3>
        <p className="text-gray-500 mb-6 max-w-xs">
          It looks like you haven't set up your restaurant profile yet.
        </p>
        <Link
          href="/register-resturant"
          className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md"
        >
          Register Restaurant
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Store className="text-orange-600" size={20} />
          {restaurant.name}
        </h2>
        <Link
          href="/update-resturant"
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-orange-100"
        >
          <Settings size={16} />
          Update
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
            <MapPin size={18} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {restaurant.streetAddress}
            </p>
            <p className="text-xs text-gray-500">
              {restaurant.city}, {restaurant.state} {restaurant.zip}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
            <Phone size={18} />
          </div>
          <p className="text-sm font-medium text-gray-900">
            {restaurant.phone}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
            <Mail size={18} />
          </div>
          <p className="text-sm font-medium text-gray-900">
            {restaurant.email}
          </p>
        </div>

        <div className="pt-4 border-t border-gray-100 mt-4">
          <div className="flex flex-col gap-1 items-start justify-between text-xs text-gray-500">
            <div className="flex w-full items-center justify-between">
              <span className="flex items-center gap-1">
                <Clock size={12} /> Resturant Created at:
              </span>
              <span className="font-medium">
                {new Date(restaurant.createdAt).toLocaleString([], {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>

            <div className="flex w-full items-center justify-between">
              <span className="flex items-center gap-1">
                <Clock size={12} /> Last updated:
              </span>
              <span className="font-medium">
                {new Date(restaurant.updatedAt).toLocaleString([], {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
