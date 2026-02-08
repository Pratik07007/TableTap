"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

interface OrderItem {
  id: string;
  quantity: number;
  unitName: string;
  price: number;
  menuItem: {
    name: string;
    imageUrl?: string;
  };
}

interface User {
  firstName: string;
  lastName: string;
  email: string;
}

interface Order {
  id: string;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  status: "PENDING" | "COOKING" | "READY" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  user: User;
  items: OrderItem[];
  bill?: {
    id: string;
    totalAmount: number;
    paymentStatus: "PENDING" | "PAID" | "FAILED";
    paymentMethod?: "CASH" | "ONLINE";
  };
}

interface Pagination {
  totalOrders: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

interface OrdersClientProps {
  initialOrders: Order[];
  pagination: Pagination;
}

export default function OrdersClient({
  initialOrders,
  pagination,
}: OrdersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setLoadingId(orderId);
      await axios.patch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"
        }/api/orders/${orderId}/status`,
        { status: newStatus },
        { withCredentials: true },
      );
      toast.success("Order status updated");
      startTransition(() => {
        router.refresh();
      });
      // Update selected order if it's open
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: newStatus as any } : null,
        );
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setLoadingId(null);
    }
  };

  const handleGenerateBill = async (orderId: string) => {
    try {
      setLoadingId(orderId);
      await axios.post(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"
        }/api/billing/generate`,
        { orderId },
        { withCredentials: true },
      );
      toast.success("Bill generated successfully");
      router.push(`/billing/${orderId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to generate bill");
    } finally {
      setLoadingId(null);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    const params = new URLSearchParams(searchParams.toString());
    if (email) {
      params.set("email", email);
      params.set("page", "1"); // Reset to page 1 on search
    } else {
      params.delete("email");
    }

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 relative">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Order Details
        </h1>

        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
          <input
            name="email"
            defaultValue={searchParams.get("email")?.toString()}
            placeholder="Filter by user email..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all disabled:opacity-50"
            disabled={isPending}
          />
          {isPending && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            </div>
          )}
        </form>
      </div>

      <div
        className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative transition-opacity duration-200 ${
          isPending ? "opacity-60 pointer-events-none" : ""
        }`}
      >
        {isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/20 backdrop-blur-[1px]">
            {/* Spinner already in search bar, but could add here too if needed */}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
              <tr>
                {/* <th className="px-6 py-4">Order ID</th> */}
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Items Summary</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {initialOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="hover:bg-gray-50/80 transition-colors cursor-pointer active:bg-gray-100"
                >
                  {/* <td className="px-6 py-4 font-mono text-xs text-gray-500">
                    {order.id.slice(0, 8)}...
                  </td> */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {order.user?.firstName} {order.user?.lastName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {order.user?.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate text-gray-600">
                    {order.items.length} items (
                    {order.items
                      .map((i) => i.menuItem.name)
                      .slice(0, 2)
                      .join(", ")}
                    {order.items.length > 2 ? "..." : ""})
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    ${order.finalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td
                    className="px-6 py-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {loadingId === order.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      ) : (
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value)
                          }
                          className="text-xs border-gray-200 rounded-md py-1 px-2 focus:ring-0 focus:border-gray-300 cursor-pointer"
                          disabled={
                            loadingId === order.id ||
                            order.status === "CANCELLED"
                          }
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option
                            value="PENDING"
                            disabled={order.status !== "PENDING"}
                          >
                            Pending
                          </option>
                          <option
                            value="COOKING"
                            disabled={
                              order.status !== "PENDING" &&
                              order.status !== "COOKING"
                            }
                          >
                            Cooking
                          </option>
                          <option
                            value="READY"
                            disabled={
                              order.status !== "COOKING" &&
                              order.status !== "READY"
                            }
                          >
                            Ready
                          </option>
                          <option
                            value="COMPLETED"
                            disabled={
                              order.status !== "READY" &&
                              order.status !== "COMPLETED"
                            }
                          >
                            Completed
                          </option>
                          <option
                            value="CANCELLED"
                            disabled={
                              order.status !== "PENDING" &&
                              order.status !== "CANCELLED"
                            }
                          >
                            Cancelled
                          </option>
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {initialOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1 || isPending}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={
                pagination.currentPage >= pagination.totalPages || isPending
              }
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-md">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Order Details
                </h2>
                <span className="text-xs font-mono text-gray-400">
                  #{selectedOrder.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Customer & Order Info */}
              <div className="grid md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Customer
                  </h3>
                  <div className="font-medium text-gray-900">
                    {selectedOrder.user?.firstName}{" "}
                    {selectedOrder.user?.lastName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedOrder.user?.email}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Order Info
                  </h3>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-600">Status:</span>
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                  <div className="text-sm text-gray-600">
                    Date: {new Date(selectedOrder.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Items Ordered
                </h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3">Item</th>
                        <th className="px-4 py-3">Unit</th>
                        <th className="px-4 py-3 text-right">Price</th>
                        <th className="px-4 py-3 text-center">Qty</th>
                        <th className="px-4 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedOrder.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {item.menuItem.imageUrl && (
                                <img
                                  src={item.menuItem.imageUrl}
                                  alt=""
                                  className="h-10 w-10 rounded-md object-cover bg-gray-100"
                                />
                              )}
                              <span className="font-medium text-gray-900">
                                {item.menuItem.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {item.unitName}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-600">
                            ${item.price.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div className="flex justify-end">
                <div className="w-full md:w-1/3 bg-gray-50 p-6 rounded-xl space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Discount</span>
                    <span className="text-green-600">
                      -${selectedOrder.discount.toFixed(2)}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-200 flex justify-between font-bold text-lg text-gray-900">
                    <span>Final Total</span>
                    <span>${selectedOrder.finalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Billing Section */}
              <div className="flex justify-end pt-4">
                {selectedOrder.bill ? (
                  <button
                    onClick={() => router.push(`/billing/${selectedOrder.id}`)}
                    className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Bill & Payment
                  </button>
                ) : selectedOrder.status === "COMPLETED" ? (
                  <button
                    onClick={() => handleGenerateBill(selectedOrder.id)}
                    disabled={loadingId === selectedOrder.id}
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {loadingId === selectedOrder.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                    Generate Bill
                  </button>
                ) : (
                  <div className="text-sm text-amber-600 flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-lg border border-amber-100">
                    <Clock className="h-4 w-4" />
                    Mark order as COMPLETED to generate bill
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    READY: "bg-emerald-100 text-emerald-700 border-emerald-200",
    COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-red-100 text-red-700 border-red-200",
  };

  const icons = {
    PENDING: Clock,
    READY: CheckCircle,
    COMPLETED: CheckCircle,
    CANCELLED: XCircle,
  };

  const Icon = icons[status as keyof typeof icons] || Clock;
  const style =
    styles[status as keyof typeof styles] || "bg-gray-100 text-gray-700";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}
    >
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}
