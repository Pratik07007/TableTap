"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { DollarSign, Receipt, TrendingUp, CreditCard, Loader2, Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Papa from 'papaparse';

export const AdminAnalytics = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/analytics`,
          { withCredentials: true }
        );
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (e) {
        console.error("Failed to load analytics", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const exportOrders = async () => {
    setExportLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('dateFrom', startDate.toISOString().split('T')[0]);
      if (endDate) params.append('dateTo', endDate.toISOString().split('T')[0]);
      params.append('limit', '10000'); // Large limit to get all

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders?${params.toString()}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        const orders = res.data.data;
        const csvData = orders.flatMap((order: any) =>
          order.items.map((item: any) => ({
            OrderID: order.id,
            UserName: order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest',
            UserEmail: order.user?.email || 'No email',
            ItemName: item.menuItem.name,
            UnitName: item.unitName,
            Quantity: item.quantity,
            Price: item.price,
            TotalAmount: order.totalAmount,
            FinalAmount: order.finalAmount,
            Status: order.status,
            PaymentStatus: order.bill?.paymentStatus || 'PENDING',
            CreatedAt: new Date(order.createdAt).toLocaleDateString(),
          }))
        );

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `orders_${startDate ? startDate.toISOString().split('T')[0] : 'all'}_to_${endDate ? endDate.toISOString().split('T')[0] : 'all'}.csv`;
        link.click();
      }
    } catch (e) {
      console.error("Failed to export orders", e);
    } finally {
      setExportLoading(false);
    }
  };

  const exportBills = async () => {
    setExportLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('dateFrom', startDate.toISOString().split('T')[0]);
      if (endDate) params.append('dateTo', endDate.toISOString().split('T')[0]);
      params.append('limit', '10000');

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/billing?${params.toString()}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        const bills = res.data.data;
        const csvData = bills.flatMap((bill: any) =>
          bill.order.items.map((item: any) => ({
            BillID: bill.id,
            OrderID: bill.orderId,
            UserName: bill.order.user ? `${bill.order.user.firstName} ${bill.order.user.lastName}` : 'Guest',
            UserEmail: bill.order.user?.email || 'No email',
            ItemName: item.menuItem.name,
            UnitName: item.unitName,
            Quantity: item.quantity,
            Price: item.price,
            TotalAmount: bill.totalAmount,
            PaymentMethod: bill.paymentMethod,
            PaymentStatus: bill.paymentStatus,
            CreatedAt: new Date(bill.createdAt).toLocaleDateString(),
          }))
        );

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `bills_${startDate ? startDate.toISOString().split('T')[0] : 'all'}_to_${endDate ? endDate.toISOString().split('T')[0] : 'all'}.csv`;
        link.click();
      }
    } catch (e) {
      console.error("Failed to export bills", e);
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spsin text-gray-400" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
       No Data to Show right now please crete some orders and bills to see analytics here.
      </div>
    );
  }

  const PIE_COLORS = ['#10b981', '#8b5cf6']; // Green for Cash, Purple for Khalti
  const pieData = [
    { name: 'Cash', value: data.paymentBreakdown.cash },
    { name: 'Khalti', value: data.paymentBreakdown.khalti },
  ].filter(d => d.value > 0);

  // Parse total pending vs processing from orderStats
  const pendingOrders = data.orderStats.find((s: any) => s.status === 'PENDING')?._count.id || 0;
  const cookingOrders = data.orderStats.find((s: any) => s.status === 'COOKING')?._count.id || 0;
  const readyOrders = data.orderStats.find((s: any) => s.status === 'READY')?._count.id || 0;

  return (
    <div className="space-y-6">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-xl text-green-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
            <h3 className="text-2xl font-bold text-gray-900">${data.totalRevenue.toFixed(2)}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Orders</p>
            <h3 className="text-2xl font-bold text-gray-900">{data.totalOrders}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Avg Order Value</p>
            <h3 className="text-2xl font-bold text-gray-900">${data.averageOrderValue.toFixed(2)}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Khalti Revenue</p>
            <h3 className="text-2xl font-bold text-gray-900">${data.paymentBreakdown.khalti.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Line Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-6">Revenue Trend (Last 7 Days)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.revenueTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  cursor={{ stroke: '#f3f4f6', strokeWidth: 2 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Stats */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="font-semibold text-gray-900 mb-2">Payment Methods</h3>
          <div className="flex-1 flex flex-col justify-center items-center">
            {pieData.length > 0 ? (
              <div className="w-full h-56 relative">
                 <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-gray-400 text-sm">No payment data yet</div>
            )}

            <div className="w-full mt-auto pt-6 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-2xl font-bold text-amber-500">{pendingOrders}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Pending</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-500">{cookingOrders}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Cooking</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500">{readyOrders}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Ready</div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <h3 className="font-semibold text-gray-900 mb-6">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Order ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Fulfillment</th>
                <th className="px-4 py-3 rounded-r-lg">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.recentOrders.length > 0 ? (
                data.recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-mono text-gray-500">{order.id.slice(0, 8)}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {order.user ? `${order.user.firstName} ${order.user.lastName}` : "Guest"}
                      </div>
                      <div className="text-xs text-gray-500">{order.user?.email || "No email"}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">${order.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
                        order.bill?.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                        order.bill?.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {order.bill?.paymentStatus || "PENDING"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No orders have been placed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Export Data</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholderText="Select start date"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => setEndDate(date)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholderText="Select end date"
            />
          </div>
          <button
            onClick={() => exportOrders()}
            disabled={exportLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {exportLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export Orders
          </button>
          <button
            onClick={() => exportBills()}
            disabled={exportLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {exportLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export Bills
          </button>
        </div>
      </div>
    </div>
  );
};
