"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  DollarSign,
  CreditCard,
  ArrowLeft,
  Receipt,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

interface Bill {
  id: string;
  billNumber: number;
  totalAmount: number;
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  paymentMethod?: "CASH" | "CARD" | "ONLINE";
  createdAt: string;
  order: {
    id: string;
    status: string;
    items: {
      id: string;
      quantity: number;
      price: number;
      unitName: string;
      menuItem: {
        name: string;
        imageUrl?: string;
      };
    }[];
    user?: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export default function BillingPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const router = useRouter();
  const { orderId } = use(params);

  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchBill();
  }, [orderId]);

  const fetchBill = async () => {
    try {
      const res = await axios.get(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"
        }/api/billing/${orderId}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        setBill(res.data.data);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to fetch bill details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePayBill = async (paymentMethod: "CASH" | "CARD") => {
    if (!bill) return;

    try {
      setProcessingPayment(true);
      const res = await axios.post(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"
        }/api/billing/pay`,
        { billId: bill.id, paymentMethod },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Payment successful!");
        fetchBill(); // Refresh data
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Payment failed");
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <div className="bg-red-50 p-6 rounded-xl border border-red-100 mb-6">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Bill Not Found
          </h2>
          <p className="text-gray-600">Could not find a bill for this order.</p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 font-medium flex items-center justify-center gap-2 mx-auto"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors font-medium text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </button>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Bill Preview */}
          <div className="flex-1 w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 bg-white relative">
              {/* Decorative header */}
              <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-black rounded-lg flex items-center justify-center text-white">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      Tax Invoice
                    </h1>
                    <p className="text-xs text-gray-500 font-mono">
                      #{bill.billNumber.toString().padStart(6, "0")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={bill.paymentStatus} />
                  {bill.paymentMethod && (
                    <div className="text-xs text-gray-500 mt-1 font-medium">
                      {bill.paymentMethod}
                    </div>
                  )}
                </div>
              </div>

              {/* Customer & Order Info */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Billed To
                  </h3>
                  <div className="font-medium text-gray-900 text-sm">
                    {bill.order.user
                      ? `${bill.order.user.firstName} ${bill.order.user.lastName}`
                      : "Guest"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {bill.order.user?.email || "N/A"}
                  </div>
                </div>
                <div className="text-right">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Order Info
                  </h3>
                  <div className="text-sm text-gray-600">
                    Order ID:{" "}
                    <span className="font-mono">
                      {bill.order.id.slice(0, 8)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Date: {new Date(bill.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="mb-8">
                <table className="w-full text-sm">
                  <thead className="text-gray-500 font-medium border-b border-gray-100">
                    <tr>
                      <th className="py-3 text-left">Item Description</th>
                      <th className="py-3 text-center">Qty</th>
                      <th className="py-3 text-right">Price</th>
                      <th className="py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {bill.order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-4 text-gray-900">
                          <div className="font-medium">
                            {item.menuItem.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.unitName}
                          </div>
                        </td>
                        <td className="py-4 text-center text-gray-600">
                          {item.quantity}
                        </td>
                        <td className="py-4 text-right text-gray-600">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="py-4 text-right text-gray-900 font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex justify-between items-center text-gray-600 mb-2">
                  <span>Subtotal</span>
                  <span>${bill.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600 mb-4 pb-4 border-b border-gray-200">
                  <span>Tax (0%)</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                  <span>Total Due</span>
                  <span>${bill.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Actions */}
          <div className="w-full md:w-80 sticky top-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-6">
                Payment Actions
              </h2>

              {bill.paymentStatus === "PENDING" ? (
                <div className="space-y-3">
                  <button
                    onClick={() => handlePayBill("CASH")}
                    disabled={processingPayment}
                    className="w-full flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-green-50 bg-green-50 hover:bg-green-100 hover:border-green-200 text-green-700 font-semibold transition-all disabled:opacity-50"
                  >
                    <DollarSign className="h-5 w-5" />
                    Pay with Cash
                  </button>
                  <button
                    onClick={() => handlePayBill("CARD")}
                    disabled={processingPayment}
                    className="w-full flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-indigo-50 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-200 text-indigo-700 font-semibold transition-all disabled:opacity-50"
                  >
                    <CreditCard className="h-5 w-5" />
                    Pay with Card
                  </button>
                  {processingPayment && (
                    <div className="text-center text-xs text-gray-500 flex items-center justify-center gap-2 mt-2">
                      <Loader2 className="h-3 w-3 animate-spin" /> Processing...
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">Bill Paid</h3>
                  <p className="text-sm text-gray-500">
                    This bill has been settled.
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
                    Paid via {bill.paymentMethod}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 bg-amber-50 rounded-xl p-4 border border-amber-100">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                <div className="text-sm text-amber-800">
                  <strong>Note:</strong> Paying this bill will mark the status
                  as PAID. The order is already Served.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "PAID") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
        <CheckCircle className="h-3 w-3" /> PAID
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
      <Clock className="h-3 w-3" /> PENDING
    </span>
  );
}
