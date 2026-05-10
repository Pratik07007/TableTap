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

  // Form States - Standardized with User Side
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

  const handleManualMarkReceived = async () => {
    if (!bill) return;
    try {
      setProcessingPayment(true);
      
      let payload = {};
      if (paymentType === "CASH") {
        const paid = parseFloat(cashGiven || "0");
        if (isNaN(paid) || paid < bill.totalAmount) {
          toast.error("Enter valid cash amount (>= total due)");
          setProcessingPayment(false);
          return;
        }
        payload = {
          billId: bill.id,
          paymentMethod: "CASH",
          amountTendered: paid,
          cashAmount: bill.totalAmount,
          khaltiAmount: 0,
        };
      } else if (paymentType === "KHALTI") {
        payload = {
          billId: bill.id,
          paymentMethod: "KHALTI",
          khaltiAmount: bill.totalAmount,
          cashAmount: 0,
          amountTendered: bill.totalAmount,
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"}/api/billing/pay`,
        payload,
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Payment marked as received successfully!");
        fetchBill();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to mark payment");
    } finally {
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
                    <div className="text-xs text-gray-500 mt-1 font-medium italic">
                      {bill.paymentMethod}
                    </div>
                  )}
                </div>
              </div>

              {/* Customer & Order Info */}
              <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Billed To</h3>
                  <div className="font-bold text-gray-900">{bill.order.user ? `${bill.order.user.firstName} ${bill.order.user.lastName}` : "Guest"}</div>
                  <div className="text-gray-500">{bill.order.user?.email || "N/A"}</div>
                </div>
                <div className="text-right">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Order Details</h3>
                  <div className="text-gray-600 font-mono text-[10px]">{bill.order.id}</div>
                  <div className="text-gray-600 mt-1">{new Date(bill.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-8 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4 text-left">Item</th>
                      <th className="py-3 px-4 text-center">Qty</th>
                      <th className="py-3 px-4 text-right">Price</th>
                      <th className="py-3 px-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {bill.order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-4 px-4 text-gray-900 font-medium">
                          {item.menuItem.name}
                          <span className="block text-[10px] text-gray-400 normal-case">{item.unitName}</span>
                        </td>
                        <td className="py-4 px-4 text-center text-gray-600">{item.quantity}</td>
                        <td className="py-4 px-4 text-right text-gray-600">${item.price.toFixed(2)}</td>
                        <td className="py-4 px-4 text-right text-gray-900 font-bold">${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Section */}
              <div className="bg-gray-900 rounded-2xl p-6 text-white ml-auto max-w-[300px]">
                <div className="flex justify-between items-center text-xs opacity-60 mb-2">
                  <span>Subtotal</span>
                  <span>${bill.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center font-black text-xl pt-3 border-t border-white/10">
                  <span>Total Due</span>
                  <span>${bill.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Details Overlay (If Paid) */}
              {bill.paymentStatus === "PAID" && (
                <div className="mt-8 pt-8 border-t border-dashed border-gray-200 grid grid-cols-2 gap-6">
                   <div className="space-y-4">
                      <p className="text-xs font-bold text-gray-400 uppercase">Payment Summary</p>
                      <div className="space-y-2">
                         <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Method</span>
                            <span className="font-bold text-indigo-600">{bill.paymentMethod}</span>
                         </div>
                         <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Date</span>
                            <span className="font-medium text-gray-900">{bill.paidAt ? new Date(bill.paidAt).toLocaleString() : "-"}</span>
                         </div>
                      </div>
                   </div>
                   <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between text-xs">
                         <span className="text-gray-500">Tendered</span>
                         <span className="font-bold text-gray-900">${(bill.amountTendered || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs pt-2 border-t border-gray-200">
                         <span className="text-gray-500">Change Given</span>
                         <span className="font-bold text-green-600">${(bill.changeGiven || 0).toFixed(2)}</span>
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Panel (Standardized) */}
          <div className="w-full md:w-[380px] shrink-0 sticky top-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-500" />
                  Payment Processing
                </h2>
              </div>

              <div className="p-6">
                {bill.paymentStatus === "PENDING" ? (
                  <div className="space-y-6">
                    {/* Tabs */}
                    <div className="flex p-1 bg-gray-100 rounded-lg">
                       {["CASH", "KHALTI", "SPLIT"].map((type) => (
                          <button
                            key={type}
                            onClick={() => setPaymentType(type as any)}
                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${
                              paymentType === type 
                                ? "bg-white text-gray-900 shadow-sm" 
                                : "text-gray-400 hover:text-gray-600"
                            }`}
                          >
                            {type}
                          </button>
                       ))}
                    </div>

                    {/* CASH Form */}
                    {paymentType === "CASH" && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Cash Received</label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type="number"
                              value={cashGiven}
                              onChange={(e) => setCashGiven(e.target.value)}
                              placeholder="0.00"
                              className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                            />
                          </div>
                        </div>

                        {cashGiven && (
                          <div className="bg-gray-900 rounded-xl p-4 space-y-2 text-white/80 text-xs">
                            <div className="flex justify-between">
                              <span>Subtotal</span>
                              <span>${bill.totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-black text-white text-sm pt-2 border-t border-white/10">
                              <span>Change To Return</span>
                              <span className={changeDueCash >= 0 ? "text-green-400" : "text-red-400"}>
                                ${changeDueCash.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={handleManualMarkReceived}
                          disabled={processingPayment}
                          className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                          {processingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle size={18} />}
                          Confirm Payment
                        </button>
                      </div>
                    )}

                    {/* KHALTI Form */}
                    {paymentType === "KHALTI" && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 text-center space-y-4">
                          <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Online Khalti QR</p>
                          <div className="bg-white p-4 rounded-xl inline-block shadow-sm">
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=TableTap-Khalti-Full-${bill.billNumber}`} 
                              alt="Khalti QR"
                              className="w-28 h-28"
                            />
                          </div>
                          <h3 className="text-2xl font-black text-purple-900">${bill.totalAmount.toFixed(2)}</h3>
                        </div>
                        
                        <button
                          onClick={handleManualMarkReceived}
                          disabled={processingPayment}
                          className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                          {processingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle size={18} />}
                          Mark as Paid
                        </button>
                      </div>
                    )}

                    {/* SPLIT Form */}
                    {paymentType === "SPLIT" && (
                      <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-gray-400 uppercase">Khalti Portion</label>
                              <div className="relative">
                                <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 text-purple-400 w-3 h-3" />
                                <input
                                  type="number"
                                  value={splitKhalti}
                                  onChange={(e) => setSplitKhalti(e.target.value)}
                                  placeholder="0.00"
                                  className="w-full pl-7 pr-2 py-2.5 rounded-lg border border-gray-200 text-xs font-bold"
                                />
                              </div>
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-gray-400 uppercase">Cash Portion</label>
                              <div className="relative">
                                <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 text-green-400 w-3 h-3" />
                                <input
                                  type="number"
                                  value={splitCash}
                                  onChange={(e) => setSplitCash(e.target.value)}
                                  placeholder="0.00"
                                  className="w-full pl-7 pr-2 py-2.5 rounded-lg border border-gray-200 text-xs font-bold"
                                />
                              </div>
                           </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                           <div className="flex justify-between text-[10px] font-black">
                              <span className="text-gray-400 uppercase">Total Sum</span>
                              <span className={Math.abs(parseFloat(splitKhalti||"0")+parseFloat(splitCash||"0") - bill.totalAmount) > 0.01 ? "text-red-500" : "text-indigo-600"}>
                                ${(parseFloat(splitKhalti||"0")+parseFloat(splitCash||"0")).toFixed(2)}
                              </span>
                           </div>
                           
                           <div className="pt-4 border-t border-gray-200 text-center">
                              <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">Counter Cash Calculator</p>
                              <div className="relative max-w-[120px] mx-auto mb-2">
                                <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                                <input
                                  type="number"
                                  value={cashGiven}
                                  onChange={(e) => setCashGiven(e.target.value)}
                                  placeholder="Tendered"
                                  className="w-full pl-6 pr-2 py-1.5 bg-white border border-gray-200 rounded text-xs font-bold"
                                />
                              </div>
                              {cashGiven && splitCash && (
                                <p className="text-xs font-black text-green-600">Change: ${(parseFloat(cashGiven) - parseFloat(splitCash)).toFixed(2)}</p>
                              )}
                           </div>
                        </div>

                        {splitKhalti && parseFloat(splitKhalti) > 0 && (
                          <div className="bg-purple-50 p-4 rounded-xl border border-dashed border-purple-200 flex flex-col items-center gap-3">
                            <p className="text-[10px] font-black text-purple-400 uppercase">Khalti Split QR</p>
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=Split-Khalti-${bill.billNumber}`} 
                              alt="Split QR"
                              className="w-24 h-24"
                            />
                            <p className="text-xs font-bold text-purple-900">${parseFloat(splitKhalti).toFixed(2)}</p>
                          </div>
                        )}

                        <button
                          onClick={handleManualMarkReceived}
                          disabled={processingPayment}
                          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                          {processingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle size={18} />}
                          Mark Full Shared Paid
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10 space-y-6">
                    <div className="h-20 w-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle size={40} />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-xl">Order Settled</h3>
                      <p className="text-xs text-gray-500 mt-1">Status: Fully Paid</p>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          setSendingInvoice(true);
                          const res = await axios.post(
                            `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"}/api/billing/send-invoice`,
                            { billId: bill.id },
                            { withCredentials: true }
                          );
                          if (res.data.success) toast.success("Invoice sent!");
                        } catch (e: any) {
                          toast.error("Failed to send invoice");
                        } finally {
                          setSendingInvoice(false);
                        }
                      }}
                      disabled={sendingInvoice}
                      className="w-full py-3.5 rounded-xl border-2 border-gray-100 font-bold text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                    >
                      {sendingInvoice ? <Loader2 size={16} className="animate-spin" /> : <Receipt size={16} />}
                      Email Invoice
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
      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black bg-green-500 text-white shadow-sm shadow-green-100">
        <CheckCircle className="h-3 w-3" /> PAID
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black bg-orange-500 text-white shadow-sm shadow-orange-100">
      <Clock className="h-3 w-3" /> PENDING
    </span>
  );
}
