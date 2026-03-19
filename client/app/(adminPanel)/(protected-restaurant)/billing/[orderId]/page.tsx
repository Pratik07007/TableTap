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
    status: string;
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
  const searchParams = useSearchParams();
  const { orderId } = use(params);

  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifyingKhalti, setVerifyingKhalti] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [sendingInvoice, setSendingInvoice] = useState(false);

  // Form States
  const [paymentType, setPaymentType] = useState<"CASH" | "KHALTI" | "SPLIT">("CASH");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        toast.success("Khalti Payment Verified Successfully!");
        router.replace(`/billing/${orderId}`);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to verify Khalti payment");
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
      toast.error(error.message || "Failed to fetch bill details");
    } finally {
      setLoading(false);
    }
  };

  const handlePayCash = async () => {
    if (!bill) return;
    try {
      setProcessingPayment(true);
      const paid = parseFloat(cashGiven || "0");
      if (isNaN(paid) || paid < bill.totalAmount) {
        toast.error("Enter valid cash amount (>= total due)");
        setProcessingPayment(false);
        return;
      }

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"}/api/billing/pay`,
        {
          billId: bill.id,
          paymentMethod: "CASH",
          amountTendered: paid,
          cashAmount: bill.totalAmount,
          khaltiAmount: 0,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(`Payment successful! Change: $${(paid - bill.totalAmount).toFixed(2)}`);
        fetchBill();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Payment failed");
    } finally {
      setProcessingPayment(false);
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
        if (tendered < cAmt) {
          toast.error("Amount tendered must be >= cash portion");
          setProcessingPayment(false);
          return;
        }

        payload = {
          billId: bill.id,
          paymentMethod: "SPLIT",
          khaltiAmount: kAmt,
          cashAmount: cAmt,
          amountTendered: tendered,
        };
      }

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"}/api/khalti/initiate`,
        payload,
        { withCredentials: true }
      );

      if (res.data.success && res.data.payment_url) {
        // Redirect to Khalti
        window.location.href = res.data.payment_url;
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to initiate Khalti");
      setProcessingPayment(false);
    }
  };

  if (loading || verifyingKhalti) {
    return (
      <div className="flex flex-col h-[80vh] items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        {verifyingKhalti && <p className="text-gray-500 font-medium">Verifying Khalti Payment...</p>}
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <div className="bg-red-50 p-6 rounded-xl border border-red-100 mb-6">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Bill Not Found</h2>
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

  const changeDueCash = cashGiven ? Math.max(0, parseFloat(cashGiven) - bill.totalAmount) : 0;
  const changeDueSplit = cashGiven && splitCash ? Math.max(0, parseFloat(cashGiven) - parseFloat(splitCash)) : 0;

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
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
              <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-black rounded-lg flex items-center justify-center text-white">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Tax Invoice</h1>
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
                    Order ID: <span className="font-mono">{bill.order.id.slice(0, 8)}</span>
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
                          <div className="font-medium">{item.menuItem.name}</div>
                          <div className="text-xs text-gray-500">{item.unitName}</div>
                        </td>
                        <td className="py-4 text-center text-gray-600">{item.quantity}</td>
                        <td className="py-4 text-right text-gray-600">${item.price.toFixed(2)}</td>
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

              {/* Paid Details */}
              {bill.paymentStatus === "PAID" && (
                <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <div className="text-sm font-semibold text-gray-900 mb-4 border-b pb-2">
                    Payment Details
                  </div>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600 flex justify-between">
                      <span className="font-medium">Method</span>
                      <span className="font-semibold text-indigo-700">{bill.paymentMethod}</span>
                    </div>
                    
                    {bill.paymentMethod === "SPLIT" && (
                      <div className="pl-4 border-l-2 border-gray-200 space-y-2 py-1">
                        <div className="text-xs text-gray-500 flex justify-between">
                          <span>Khalti Portion</span>
                          <span>${(bill.khaltiAmount || 0).toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-gray-500 flex justify-between">
                          <span>Cash Portion</span>
                          <span>${(bill.cashAmount || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    {(bill.paymentMethod === "CASH" || bill.paymentMethod === "SPLIT") && (
                      <>
                        <div className="text-sm text-gray-600 flex justify-between">
                          <span>Amount Tendered (Cash)</span>
                          <span>${(bill.amountTendered || 0).toFixed(2)}</span>
                        </div>
                        <div className="text-sm text-gray-600 flex justify-between">
                          <span>Change Given</span>
                          <span>${(bill.changeGiven || 0).toFixed(2)}</span>
                        </div>
                      </>
                    )}

                    <div className="text-sm text-gray-600 flex justify-between pt-2 border-t border-gray-50">
                      <span>Paid At</span>
                      <span>{bill.paidAt ? new Date(bill.paidAt).toLocaleString() : "-"}</span>
                    </div>
                    {bill.transactionId && (
                      <div className="text-sm text-gray-600 flex justify-between">
                        <span>Transaction ID</span>
                        <span className="font-mono text-xs max-w-[150px] truncate">{bill.transactionId}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Actions */}
          <div className="w-full md:w-[380px] shrink-0 sticky top-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-500" />
                  Payment Actions
                </h2>
              </div>

              <div className="p-6">
                {bill.paymentStatus === "PENDING" ? (
                  <div className="space-y-6">
                    {/* Tabs */}
                    <div className="flex p-1 bg-gray-100 rounded-lg">
                      <button
                        onClick={() => setPaymentType("CASH")}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                          paymentType === "CASH" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Cash
                      </button>
                      <button
                        onClick={() => setPaymentType("KHALTI")}
                        className={`flex-1 flex items-center justify-center gap-1 py-2 text-sm font-medium rounded-md transition-all ${
                          paymentType === "KHALTI" ? "bg-purple-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Khalti
                      </button>
                      <button
                        onClick={() => setPaymentType("SPLIT")}
                        className={`flex-1 flex items-center justify-center gap-1 py-2 text-sm font-medium rounded-md transition-all ${
                          paymentType === "SPLIT" ? "bg-indigo-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Split
                      </button>
                    </div>

                    {/* Form: CASH */}
                    {paymentType === "CASH" && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-700">Cash Received</label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type="number"
                              step="0.01"
                              value={cashGiven}
                              onChange={(e) => setCashGiven(e.target.value)}
                              placeholder="0.00"
                              className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            />
                          </div>
                        </div>

                        {cashGiven && (
                          <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-100">
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Total Due</span>
                              <span className="font-medium">${bill.totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-200">
                              <span>Change To Return</span>
                              <span className={changeDueCash >= 0 ? "text-green-600" : "text-red-500"}>
                                ${changeDueCash.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={handlePayCash}
                          disabled={processingPayment}
                          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gray-900 hover:bg-black text-white font-semibold transition-all disabled:opacity-70 shadow-sm"
                        >
                          {processingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : <DollarSign className="w-5 h-5" />}
                          Complete Cash Payment
                        </button>
                      </div>
                    )}

                    {/* Form: KHALTI */}
                    {paymentType === "KHALTI" && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-center space-y-2">
                          <div className="text-purple-700 font-semibold">Total to Pay Online</div>
                          <div className="text-3xl font-bold text-purple-900">${bill.totalAmount.toFixed(2)}</div>
                          <p className="text-xs text-purple-600/80 mt-2">
                            You will be redirected to Khalti to securely process the payment.
                          </p>
                        </div>
                        
                        <button
                          onClick={handleInitiateKhalti}
                          disabled={processingPayment}
                          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-all disabled:opacity-70 shadow-sm shadow-purple-200"
                        >
                          {processingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                          Pay with Khalti
                        </button>
                      </div>
                    )}

                    {/* Form: SPLIT */}
                    {paymentType === "SPLIT" && (
                      <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-semibold text-indigo-500 uppercase">Total Due</div>
                            <div className="text-xl font-bold text-indigo-900">${bill.totalAmount.toFixed(2)}</div>
                          </div>
                          <SplitSquareHorizontal className="w-6 h-6 text-indigo-300" />
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Khalti Amount</label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 w-4 h-4" />
                              <input
                                type="number"
                                step="0.01"
                                value={splitKhalti}
                                onChange={(e) => setSplitKhalti(e.target.value)}
                                placeholder="0.00"
                                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-medium"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cash Amount</label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 w-4 h-4" />
                              <input
                                type="number"
                                step="0.01"
                                value={splitCash}
                                onChange={(e) => setSplitCash(e.target.value)}
                                placeholder="0.00"
                                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all font-medium"
                              />
                            </div>
                          </div>
                        </div>

                        {splitCash && splitKhalti && (
                          <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Sum of Split</span>
                              <span className={
                                Math.abs(parseFloat(splitCash||"0") + parseFloat(splitKhalti||"0") - bill.totalAmount) > 0.01 
                                ? "text-red-500 font-bold" : "text-green-600 font-bold"
                              }>
                                ${(parseFloat(splitCash||"0") + parseFloat(splitKhalti||"0")).toFixed(2)}
                              </span>
                            </div>

                            <div className="pt-3 border-t border-gray-200 space-y-1.5">
                              <label className="text-xs font-semibold text-gray-600">Actual Cash Received from Customer</label>
                              <div className="relative">
                                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                                <input
                                  type="number"
                                  step="0.01"
                                  value={cashGiven}
                                  onChange={(e) => setCashGiven(e.target.value)}
                                  placeholder="0.00"
                                  className="w-full pl-7 pr-3 py-2 text-sm rounded bg-white border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                              </div>
                            </div>
                            {cashGiven && (
                              <div className="flex justify-between font-semibold text-sm text-gray-900 pt-1">
                                <span>Change to return</span>
                                <span className={changeDueSplit >= 0 ? "text-green-600" : "text-red-500"}>
                                  ${changeDueSplit.toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        <button
                          onClick={handleInitiateKhalti}
                          disabled={processingPayment}
                          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all disabled:opacity-70 shadow-sm shadow-indigo-200"
                        >
                          {processingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : <SplitSquareHorizontal className="w-5 h-5" />}
                          Process Split Payment
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">Bill Paid</h3>
                    <p className="text-sm text-gray-500 mb-5">
                      This bill has been successfully settled.
                    </p>
                    <button
                      onClick={async () => {
                        try {
                          setSendingInvoice(true);
                          const res = await axios.post(
                            `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"}/api/billing/send-invoice`,
                            { billId: bill.id },
                            { withCredentials: true }
                          );
                          if (res.data.success) {
                            toast.success("Invoice email sent!");
                          } else {
                            toast.error(res.data.message || "Failed to send invoice");
                          }
                        } catch (e: any) {
                          toast.error(e.message || "Failed to send invoice");
                        } finally {
                          setSendingInvoice(false);
                        }
                      }}
                      disabled={sendingInvoice}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-800 font-semibold transition-colors disabled:opacity-50"
                    >
                      {sendingInvoice ? <Loader2 className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
                      Send Invoice Email
                    </button>
                  </div>
                )}
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
