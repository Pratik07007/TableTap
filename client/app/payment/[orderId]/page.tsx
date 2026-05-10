"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  DollarSign,
  ArrowLeft,
  Receipt,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  SplitSquareHorizontal,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

interface Bill {
  id: string;
  billNumber: number;
  totalAmount: number;
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  paymentMethod?: "CASH" | "KHALTI" | "SPLIT";
  cashAmount?: number;
  khaltiAmount?: number;
  amountTendered?: number;
  changeGiven?: number;
  paidAt?: string;
  transactionId?: string;
  createdAt: string;
  order: {
    id: string;
    items: {
      id: string;
      quantity: number;
      price: number;
      unitName: string;
      menuItem: {
        name: string;
        images?: { url: string }[];
      };
    }[];
    restaurant: {
      name: string;
    };
  };
}

export default function UserPaymentPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { orderId } = use(params);

  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifyingKhalti, setVerifyingKhalti] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Form States - Mirroring Admin Panel
  const [paymentType, setPaymentType] = useState<"CASH" | "KHALTI" | "SPLIT">("KHALTI");
  const [cashGiven, setCashGiven] = useState<string>("");
  const [splitCash, setSplitCash] = useState<string>("");
  const [splitKhalti, setSplitKhalti] = useState<string>("");

  useEffect(() => {
    const pidx = searchParams.get("pidx");
    if (pidx) {
      verifyKhaltiPayment(pidx);
    } else {
      fetchBill();
    }
  }, [orderId, searchParams]);

  const verifyKhaltiPayment = async (pidx: string) => {
    try {
      setVerifyingKhalti(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"}/api/khalti/verify`,
        { pidx },
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success("Payment Verified Successfully!");
        router.replace("/my-orders");
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to verify payment");
    } finally {
      setVerifyingKhalti(false);
      fetchBill();
    }
  };

  const fetchBill = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"}/api/billing/${orderId}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        setBill(res.data.data);
      }
    } catch (error: any) {
      toast.error("Bill not ready yet. Please wait for the restaurant to serve your order.");
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateKhalti = async () => {
    if (!bill) return;
    try {
      setProcessingPayment(true);
      let payload = {};

      if (paymentType === "KHALTI") {
        payload = {
          billId: bill.id,
          paymentMethod: "KHALTI",
          khaltiAmount: bill.totalAmount,
          cashAmount: 0,
          amountTendered: 0,
        };
      } else if (paymentType === "SPLIT") {
        const cAmt = parseFloat(splitCash || "0");
        const kAmt = parseFloat(splitKhalti || "0");
        const tendered = parseFloat(cashGiven || "0");

        if (Math.abs(cAmt + kAmt - bill.totalAmount) > 0.01) {
          toast.error("Split amounts must exact equal the total due");
          setProcessingPayment(false);
          return;
        }

        payload = {
          billId: bill.id,
          paymentMethod: "SPLIT",
          khaltiAmount: kAmt,
          cashAmount: cAmt,
          amountTendered: tendered, // Help record what their intent was
        };
      }

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"}/api/khalti/initiate`,
        payload,
        { withCredentials: true }
      );

      if (res.data.success && res.data.payment_url) {
        window.location.href = res.data.payment_url;
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to initiate payment");
      setProcessingPayment(false);
    }
  };

  if (loading || verifyingKhalti) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        <p className="text-gray-500 font-medium">
          {verifyingKhalti ? "Verifying Payment..." : "Loading Billing Details..."}
        </p>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Wait a moment!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your bill is not ready for payment yet. Bills are usually generated once the order is served.
          </p>
          <button
            onClick={() => router.push("/my-orders")}
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-black transition-colors"
          >
            Back to My Orders
          </button>
        </div>
      </div>
    );
  }

  const changeDueCash = cashGiven ? Math.max(0, parseFloat(cashGiven) - bill.totalAmount) : 0;
  const changeDueSplit = cashGiven && splitCash ? Math.max(0, parseFloat(cashGiven) - parseFloat(splitCash)) : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors font-medium text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Order Summary - Left Side */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-orange-500" />
                Order Summary
              </h2>
            </div>
            
            <div className="p-6">
              <div className="mb-6 pb-6 border-b border-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-gray-400 uppercase">Bill No.</span>
                  <span className="text-xs font-mono text-gray-900">#{bill.billNumber.toString().padStart(6, "0")}</span>
                </div>
                <div className="space-y-3">
                  {bill.order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start text-sm">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.menuItem.name}</p>
                        <p className="text-xs text-gray-500">{item.quantity} x {item.unitName}</p>
                      </div>
                      <span className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-gray-500 text-sm">
                  <span>Subtotal</span>
                  <span>${bill.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2">
                  <span>Total Amount</span>
                  <span>${bill.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {bill.paymentStatus === "PAID" && (
                <div className="mt-8 bg-green-50 rounded-xl p-4 flex items-center gap-3">
                  <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-green-900">Payment Completed</p>
                    <p className="text-green-700 text-xs">Thank you for your visit!</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Interface - Right Side (Mirrored) */}
          <div className="w-full">
            {bill.paymentStatus !== "PAID" ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-indigo-500" />
                    Secure Checkout
                  </h2>
                </div>

                <div className="p-6 space-y-6">
                  {/* Tabs mirroring Admin Panel */}
                  <div className="flex p-1 bg-gray-100 rounded-lg">
                    <button
                      onClick={() => setPaymentType("CASH")}
                      className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                        paymentType === "CASH" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                      }`}
                    >
                      Cash
                    </button>
                    <button
                      onClick={() => setPaymentType("KHALTI")}
                      className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                        paymentType === "KHALTI" ? "bg-purple-600 text-white shadow-sm" : "text-gray-500"
                      }`}
                    >
                      Khalti
                    </button>
                    <button
                      onClick={() => setPaymentType("SPLIT")}
                      className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                        paymentType === "SPLIT" ? "bg-indigo-600 text-white shadow-sm" : "text-gray-500"
                      }`}
                    >
                      Split
                    </button>
                  </div>

                  {/* CASH Section */}
                  {paymentType === "CASH" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase">Cash at Counter</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="number"
                            value={cashGiven}
                            onChange={(e) => setCashGiven(e.target.value)}
                            placeholder="Amount you'll give"
                            className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                          />
                        </div>
                      </div>
                      
                      {cashGiven && (
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Total to Pay</span>
                            <span className="font-bold">${bill.totalAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                            <span>Change Expected</span>
                            <span className={changeDueCash >= 0 ? "text-green-600" : "text-red-500"}>
                              ${changeDueCash.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
                        <p className="text-xs text-blue-700 leading-relaxed font-medium">
                          Please proceed to the billing counter with your Order ID. Our staff will confirm your cash payment.
                        </p>
                      </div>

                      <button
                        onClick={() => router.push("/my-orders")}
                        className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <ArrowLeft size={18} /> Back to Dashboard
                      </button>
                    </div>
                  )}

                  {/* KHALTI Section */}
                  {paymentType === "KHALTI" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 text-center">
                      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-8">
                        <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">Total Amount</p>
                        <h3 className="text-4xl font-black text-purple-900">${bill.totalAmount.toFixed(2)}</h3>
                        <p className="text-[10px] text-purple-600 mt-4 font-bold border border-purple-200 inline-block px-3 py-1 rounded-full bg-white">RE-DIRECT TO KHALTI</p>
                      </div>
                      
                      <button
                        onClick={handleInitiateKhalti}
                        disabled={processingPayment}
                        className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {processingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                        Pay with Khalti
                      </button>
                    </div>
                  )}

                  {/* SPLIT Section (Mirrored from Admin) */}
                  {paymentType === "SPLIT" && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Khalti Portion (Pay Now)</label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 w-3 h-3" />
                            <input
                              type="number"
                              value={splitKhalti}
                              onChange={(e) => setSplitKhalti(e.target.value)}
                              placeholder="0.00"
                              className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Cash Portion (Pay Later)</label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 w-3 h-3" />
                            <input
                              type="number"
                              value={splitCash}
                              onChange={(e) => setSplitCash(e.target.value)}
                              placeholder="0.00"
                              className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-green-500 outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                         <div className="flex justify-between text-xs font-bold text-gray-500">
                            <span>TOTAL SUM</span>
                            <span className={Math.abs(parseFloat(splitKhalti||"0")+parseFloat(splitCash||"0") - bill.totalAmount) > 0.01 ? "text-red-500" : "text-indigo-600"}>
                              ${(parseFloat(splitKhalti||"0")+parseFloat(splitCash||"0")).toFixed(2)}
                            </span>
                         </div>
                         <div className="pt-3 border-t border-gray-200">
                            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2 text-center">Cash change Calculator</label>
                            <div className="relative max-w-[140px] mx-auto">
                              <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                              <input
                                type="number"
                                value={cashGiven}
                                onChange={(e) => setCashGiven(e.target.value)}
                                placeholder="Tendered"
                                className="w-full pl-8 pr-2 py-2 bg-white border border-gray-200 rounded text-xs font-bold focus:border-indigo-500 outline-none"
                              />
                            </div>
                            {cashGiven && splitCash && (
                              <p className="text-center mt-2 text-xs font-bold text-green-600">
                                Counter Change: ${(parseFloat(cashGiven) - parseFloat(splitCash)).toFixed(2)}
                              </p>
                            )}
                         </div>
                      </div>

                      <button
                        onClick={handleInitiateKhalti}
                        disabled={processingPayment}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {processingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : <SplitSquareHorizontal className="w-18 h-18" />}
                        Pay Khalti Portion Now
                      </button>
                    </div>
                  )}

                  {/* Trust Badges */}
                  <div className="flex items-center justify-center gap-4 opacity-40 grayscale filter mt-4">
                    <img src="https://khalti.com/static/img/khalti-logo.png" alt="Khalti" className="h-4" />
                    <div className="h-3 w-[1px] bg-gray-300" />
                    <span className="text-[9px] font-bold tracking-tighter text-gray-600">SECURE TRANSACTION</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                  <CheckCircle size={48} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Order Settled!</h2>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                  Your payment has been successfully verified. Enjoy your meal!
                </p>
                <button
                  onClick={() => router.push("/my-orders")}
                  className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
