"use client";

import {
  Calendar,
  Clock,
  ShoppingBag,
  RefreshCw,
  X,
  Plus,
  Minus,
  Filter,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Loader2,
  ChefHat,
  Package,
  AlertCircle,
  CreditCard,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  finalAmount?: number;
  createdAt: string;
  isPaid: boolean;
  paidAt?: string;
  items: OrderItem[];
  restaurant: { name: string };
};

const ALL_STATUSES = ["ALL", "PENDING", "COOKING", "READY", "COMPLETED", "CANCELLED"];

function getStatusConfig(status: string) {
  switch (status) {
    case "PENDING":
      return {
        color: "bg-yellow-50 text-yellow-700 border-yellow-200",
        dot: "bg-yellow-400",
        icon: <AlertCircle size={13} />,
      };
    case "COOKING":
      return {
        color: "bg-blue-50 text-blue-700 border-blue-200",
        dot: "bg-blue-400",
        icon: <ChefHat size={13} />,
      };
    case "READY":
      return {
        color: "bg-purple-50 text-purple-700 border-purple-200",
        dot: "bg-purple-400",
        icon: <Package size={13} />,
      };
    case "COMPLETED":
      return {
        color: "bg-green-50 text-green-700 border-green-200",
        dot: "bg-green-400",
        icon: <CheckCircle2 size={13} />,
      };
    case "CANCELLED":
      return {
        color: "bg-red-50 text-red-700 border-red-200",
        dot: "bg-red-400",
        icon: <XCircle size={13} />,
      };
    default:
      return {
        color: "bg-gray-50 text-gray-700 border-gray-200",
        dot: "bg-gray-400",
        icon: null,
      };
  }
}

export default function MyOrdersClient({
  initialOrders,
}: {
  initialOrders: Order[];
}) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedRestaurant, setSelectedRestaurant] = useState("ALL");

  const handleRefresh = async () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleCancel = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
      setIsRefreshing(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"}/api/orders/${orderId}/cancel`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      if (res.ok) handleRefresh();
      else alert("Failed to cancel order");
    } catch {
      alert("Error cancelling order");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Unique restaurant names for the dropdown
  const restaurantNames = useMemo(
    () => ["ALL", ...Array.from(new Set(initialOrders.map((o) => o.restaurant?.name || "Restaurant")))],
    [initialOrders]
  );

  // Apply filters
  const filteredOrders = useMemo(() => {
    return initialOrders.filter((o) => {
      const matchStatus = selectedStatus === "ALL" || o.status === selectedStatus;
      const matchRestaurant =
        selectedRestaurant === "ALL" ||
        (o.restaurant?.name || "Restaurant") === selectedRestaurant;
      return matchStatus && matchRestaurant;
    });
  }, [initialOrders, selectedStatus, selectedRestaurant]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">My Orders</h1>
            <p className="text-xs text-gray-500">
              {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
              {selectedStatus !== "ALL" || selectedRestaurant !== "ALL" ? " (filtered)" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-500 hover:text-orange-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-orange-50"
            >
              ← Home
            </Link>
            <button
              onClick={handleRefresh}
              className={`p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-all ${
                isRefreshing ? "animate-spin" : ""
              }`}
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-5 space-y-5">
        {/* Filters */}
        {initialOrders.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Filter size={15} className="text-orange-500" />
              Filters
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap gap-2">
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedStatus(s)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                    selectedStatus === s
                      ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Restaurant Dropdown */}
            <div className="relative inline-block">
              <select
                value={selectedRestaurant}
                onChange={(e) => setSelectedRestaurant(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-8 text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-orange-300 cursor-pointer"
              >
                {restaurantNames.map((r) => (
                  <option key={r} value={r}>
                    {r === "ALL" ? "All Restaurants" : r}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="text-orange-300" size={36} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {initialOrders.length === 0 ? "No orders yet" : "No matching orders"}
            </h2>
            <p className="text-gray-500 text-sm max-w-xs">
              {initialOrders.length === 0
                ? "You haven't placed any orders yet. Browse a restaurant to get started!"
                : "Try adjusting your filters to see more orders."}
            </p>
            {initialOrders.length === 0 && (
              <Link
                href="/dashboard"
                className="mt-6 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm"
              >
                Browse Restaurants
              </Link>
            )}
          </motion.div>
        ) : (
          filteredOrders.map((order, index) => {
            const statusCfg = getStatusConfig(order.status);
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  {/* Header row */}
                  <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-50 p-2.5 rounded-xl text-orange-600">
                        <ShoppingBag size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-base">
                          {order.restaurant?.name || "Restaurant"}
                        </h3>
                        <p className="text-xs text-gray-400 font-medium">
                          #{order.id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusCfg.color}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                      {order.status}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="space-y-2.5 mb-4">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="font-bold bg-orange-50 text-orange-700 border border-orange-100 w-6 h-6 flex items-center justify-center rounded-lg text-xs">
                            {item.quantity}
                          </span>
                          <span className="font-medium">{item.menuItem.name}</span>
                          <span className="text-xs text-gray-400">({item.unitName})</span>
                        </div>
                        <span className="text-gray-700 font-semibold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-xs text-gray-400 font-medium pl-8">
                        +{order.items.length - 3} more items
                      </p>
                    )}
                  </div>

                  {/* Footer row */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-3 text-gray-400 text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="text-base font-bold text-gray-900">
                      <span className="text-xs font-normal text-gray-400 mr-1">Total</span>$
                      {(order.finalAmount ?? order.totalAmount).toFixed(2)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-50 flex gap-3">
                    {!order.isPaid && order.status !== "CANCELLED" && (
                      <Link
                        href={`/payment/${order.id}`}
                        className="flex-1 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm shadow-orange-100"
                      >
                        <CreditCard size={16} />
                        Pay Now
                      </Link>
                    )}
                    
                    {order.status === "PENDING" && (
                      <>
                        <EditOrderButton order={order} onRefresh={handleRefresh} />
                        <button
                          onClick={() => handleCancel(order.id)}
                          className={`${!order.isPaid ? 'px-4' : 'flex-1'} py-2.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-100`}
                        >
                          {order.isPaid ? 'Cancel' : <X size={18} className="mx-auto" />}
                        </button>
                      </>
                    )}

                    {order.isPaid && (
                      <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-50 text-green-700 rounded-xl border border-green-100 text-sm font-bold">
                        <CheckCircle2 size={16} />
                        Paid
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Beautiful Edit Order Modal ────────────────────────────────────────────────

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

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  const handleUpdate = async () => {
    if (items.length === 0) return;
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"}/api/orders/${order.id}/update`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );
      if (res.ok) {
        setIsOpen(false);
        onRefresh();
      } else {
        alert("Failed to update order");
      }
    } catch {
      alert("Error updating order");
    } finally {
      setIsSaving(false);
    }
  };

  const updateQuantity = (index: number, delta: number) => {
    const newItems = [...items];
    const item = { ...newItems[index], quantity: newItems[index].quantity + delta };
    if (item.quantity <= 0) newItems.splice(index, 1);
    else newItems[index] = item;
    setItems(newItems);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex-1 py-2.5 text-sm font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors border border-orange-200"
      >
        Edit Order
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
              className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between flex-shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Edit Order</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {order.restaurant?.name} · #{order.id.slice(-6).toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-3">
                      <ShoppingBag className="text-red-400" size={24} />
                    </div>
                    <p className="font-semibold text-gray-800">Cart is empty</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Adding all items back will cancel this. Close to keep unchanged.
                    </p>
                  </div>
                ) : (
                  items.map((item, idx) => (
                    <motion.div
                      key={`${item.menuItem.id}-${idx}`}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center gap-4 bg-gray-50 rounded-2xl p-3"
                    >
                      {/* Food icon placeholder */}
                      <div className="w-11 h-11 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="text-white" size={16} />
                      </div>

                      {/* Name + unit */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {item.menuItem.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.unitName} · ${item.price.toFixed(2)} each
                        </p>
                      </div>

                      {/* Qty stepper */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => updateQuantity(idx, -1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-6 text-center font-bold text-gray-900 text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(idx, 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      {/* Line total */}
                      <div className="text-sm font-bold text-gray-900 w-14 text-right flex-shrink-0">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Running total + actions */}
              <div className="flex-shrink-0 bg-gray-50 border-t border-gray-100 px-6 pt-4 pb-6 space-y-4">
                {items.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 font-medium">
                      {items.reduce((s, i) => s + i.quantity, 0)} item
                      {items.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-3 text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={isSaving || items.length === 0}
                    className="flex-2 flex-1 py-3 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Saving...
                      </>
                    ) : items.length === 0 ? (
                      "Cart is Empty"
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
