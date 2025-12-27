"use client";

import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type OrderItem = {
  id: string;
  menuItem: { name: string; imageUrl?: string };
  unitName: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
  restaurant: { name: string };
};

export default function MyOrdersClient({
  initialOrders,
}: {
  initialOrders: Order[];
}) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "COMPLETED":
        return "bg-green-100 text-green-700 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm sticky top-0 z-40 px-6 py-4 mb-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="text-sm text-gray-500">
              Track your past and current orders
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-4">
        {initialOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <ShoppingBag className="text-gray-400" size={48} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">No orders yet</h2>
            <p className="text-gray-500 max-w-sm mt-2">
              Looks like you haven't placed any orders yet. Scan a QR code at a
              restaurant to get started!
            </p>
          </div>
        ) : (
          initialOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-50 p-2.5 rounded-xl text-orange-600">
                      <ShoppingBag size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {order.restaurant?.name || "Restaurant"}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">
                        #{order.id.slice(-6).toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="font-bold bg-gray-100 w-6 h-6 flex items-center justify-center rounded text-xs">
                          {item.quantity}x
                        </span>
                        <span>
                          {item.menuItem.name}{" "}
                          <span className="text-gray-400 text-xs">
                            ({item.unitName})
                          </span>
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-xs text-gray-500 font-medium pt-1">
                      + {order.items.length - 3} more items
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-sm">
                  <div className="flex items-center gap-4 text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      <span>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} />
                      <span>
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    Total: ${order.totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
