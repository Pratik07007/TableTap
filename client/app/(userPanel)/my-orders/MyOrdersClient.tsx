"use client";

import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  Home,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

type OrderItem = {
  id: string;
  menuItem: { id: string; name: string; images?: { url: string }[] };
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 1000); // Visual feedback
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-50 text-yellow-700 border-yellow-200 ring-yellow-100";
      case "COMPLETED":
        return "bg-green-50 text-green-700 border-green-200 ring-green-100";
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200 ring-red-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 ring-gray-100";
    }
  };

  const handleCancel = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      setIsRefreshing(true);
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"
        }/api/orders/${orderId}/cancel`,
        {
          method: "PATCH", // Changed to PATCH as per routes
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (res.ok) {
        handleRefresh();
      } else {
        alert("Failed to cancel order");
      }
    } catch (error) {
      console.error(error);
      alert("Error cancelling order");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm sticky top-0 z-40 px-6 py-4 mb-6 border-b border-gray-100">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Home size={20} className="text-gray-500" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
              <p className="text-sm text-gray-500">
                Track your past and current orders
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-all ${
              isRefreshing ? "animate-spin" : ""
            }`}
            title="Refresh Orders"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-6">
        {initialOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-white p-6 rounded-full mb-4 shadow-sm border border-gray-100">
              <ShoppingBag className="text-orange-200" size={48} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">No orders yet</h2>
            <p className="text-gray-500 max-w-sm mt-2 mb-8">
              Looks like you haven&apos;t placed any orders yet. Scan a QR code
              at a restaurant to get started!
            </p>
          </div>
        ) : (
          initialOrders.map((order, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={order.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-50 p-2.5 rounded-xl text-orange-600">
                      <ShoppingBag size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {order.restaurant?.name || "Restaurant"}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">
                        Order #{order.id.slice(-6).toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold border ring-1 ${getStatusColor(
                      order.status,
                    )}`}
                  >
                    {order.status}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="font-bold bg-gray-50 border border-gray-100 w-6 h-6 flex items-center justify-center rounded text-xs text-gray-600">
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
                    <p className="text-xs text-gray-500 font-medium pt-1 pl-8">
                      + {order.items.length - 3} more items
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <div className="flex items-center gap-4 text-gray-400 text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      <span>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} />
                      <span>
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    <span className="text-xs font-normal text-gray-400 mr-2">
                      Total
                    </span>
                    ${order.totalAmount.toFixed(2)}
                  </div>
                </div>

                {order.status === "PENDING" && (
                  <div className="mt-4 pt-4 border-t border-gray-50 flex gap-3">
                    <EditOrderButton order={order} onRefresh={handleRefresh} />
                    <button
                      onClick={() => handleCancel(order.id)}
                      className="flex-1 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function EditOrderButton({
  order,
  onRefresh,
}: {
  order: Order;
  onRefresh: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<OrderItem[]>(order.items);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = async () => {
    try {
      setIsSaving(true);
      const payload = {
        items: items.map((i) => ({
          menuItemId: i.menuItem.id,
          unitName: i.unitName,
          quantity: i.quantity,
        })),
      };

      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"
        }/api/orders/${order.id}/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );

      if (res.ok) {
        setIsOpen(false);
        onRefresh();
      } else {
        alert("Failed to update order");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating order");
    } finally {
      setIsSaving(false);
    }
  };

  const updateQuantity = (index: number, delta: number) => {
    const newItems = [...items];
    const item = { ...newItems[index] };
    item.quantity += delta;
    if (item.quantity <= 0) {
      newItems.splice(index, 1);
    } else {
      newItems[index] = item;
    }
    setItems(newItems);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex-1 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-200"
      >
        Edit Order
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg">Edit Order</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400"
              >
                &times;
              </button>
            </div>
            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {items.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  Order is empty. Saving will remove all items?
                </p>
              ) : (
                items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-gray-900">
                        {item.menuItem.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.unitName} - ${item.price}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(idx, -1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        -
                      </button>
                      <span className="w-4 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(idx, 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={isSaving || items.length === 0}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-black rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
