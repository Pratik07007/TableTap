import { cookies } from "next/headers";
import axios from "axios";
import Link from "next/link";

type BillRow = {
  id: string;
  billNumber: number;
  orderId: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod?: string;
  createdAt: string;
  order?: {
    user?: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
};

async function fetchBills(searchParams: {
  page?: string;
  limit?: string;
  paymentMethod?: string;
  email?: string;
  paymentStatus?: string;
}) {
  const page = Number(searchParams.page ?? 1);
  const limit = Number(searchParams.limit ?? 10);
  const paymentMethod = searchParams.paymentMethod;
  const email = searchParams.email;
  const paymentStatus = searchParams.paymentStatus;
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const res = await axios.get(`${base}/api/billing`, {
    params: { page, limit, paymentMethod, email, paymentStatus },
    headers: {
      Cookie: `token=${token}`,
    },
  });
  return res.data;
}

export default async function BillsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    paymentMethod?: string;
    email?: string;
    paymentStatus?: string;
  }>;
}) {
  const params = await searchParams;
  const result = await fetchBills(params);
  const bills = result.data || [];
  const pagination = result.pagination || {
    totalBills: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">All Bills</h1>
        <form className="flex xl:items-center xl:flex-row flex-col gap-3">
          <input
            type="email"
            name="email"
            placeholder="Search by customer email"
            defaultValue={params.email ?? ""}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm max-w-xs w-full lg:w-64 focus:ring-1 focus:ring-indigo-500 outline-none"
          />
          <select
            name="paymentStatus"
            defaultValue={params.paymentStatus ?? ""}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
          <select
            name="paymentMethod"
            defaultValue={params.paymentMethod ?? ""}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
          >
            <option value="">All Methods</option>
            <option value="CASH">Cash</option>
            <option value="KHALTI">Khalti</option>
            <option value="SPLIT">Split (Cash+Khalti)</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-black transition-colors"
          >
            Filter
          </button>
        </form>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Bill #</th>
              <th className="px-4 py-3 text-left">Order</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Method</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bills.map((b: BillRow) => (
              <tr key={b.id}>
                <td className="px-4 py-3 font-mono">
                  #{String(b.billNumber).padStart(6, "0")}
                </td>
                <td className="px-4 py-3">{b.orderId.slice(0, 8)}</td>
                <td className="px-4 py-3">
                  {b.order?.user
                    ? `${b.order.user.firstName} ${b.order.user.lastName}`
                    : "Guest"}
                  <div className="text-xs text-gray-500">
                    {b.order?.user?.email ?? "N/A"}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  ${Number(b.totalAmount).toFixed(2)}
                </td>
                <td className="px-4 py-3">{b.paymentStatus}</td>
                <td className="px-4 py-3">{b.paymentMethod ?? "-"}</td>
                <td className="px-4 py-3">
                  {new Date(b.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/billing/${b.orderId}`}
                    className="text-indigo-600 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {bills.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  No bills found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-500">
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        <div className="flex gap-2">
          <Link
            href={`/billing?page=${Math.max(1, pagination.currentPage - 1)}&limit=${pagination.limit}${params.paymentMethod ? `&paymentMethod=${params.paymentMethod}` : ""}${params.email ? `&email=${encodeURIComponent(params.email)}` : ""}${params.paymentStatus ? `&paymentStatus=${params.paymentStatus}` : ""}`}
            className="px-3 py-2 rounded border border-gray-200 hover:bg-gray-50 text-sm"
          >
            Prev
          </Link>
          <Link
            href={`/billing?page=${Math.min(pagination.totalPages, pagination.currentPage + 1)}&limit=${pagination.limit}${params.paymentMethod ? `&paymentMethod=${params.paymentMethod}` : ""}${params.email ? `&email=${encodeURIComponent(params.email)}` : ""}${params.paymentStatus ? `&paymentStatus=${params.paymentStatus}` : ""}`}
            className="px-3 py-2 rounded border border-gray-200 hover:bg-gray-50 text-sm"
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
