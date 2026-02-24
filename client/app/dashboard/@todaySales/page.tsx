"use client";
import { Calendar, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

type Bucket = { key: string; amount: number };
type SalesSummary = { totalEarned: number; buckets: Bucket[] };
type FilterType = "daily" | "monthly" | "yearly" | "custom";

const formatDate = (d: Date) => d.toISOString().split("T")[0];

const buildRange = (type: FilterType, start?: string, end?: string) => {
  const now = new Date();
  if (type === "daily") {
    const from = new Date(now);
    from.setHours(0, 0, 0, 0);
    const to = new Date(now);
    to.setHours(23, 59, 59, 999);
    return { from, to, groupBy: "day" as const };
  }
  if (type === "monthly") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    to.setHours(23, 59, 59, 999);
    return { from, to, groupBy: "day" as const };
  }
  if (type === "yearly") {
    const from = new Date(now.getFullYear(), 0, 1);
    const to = new Date(now.getFullYear(), 11, 31);
    to.setHours(23, 59, 59, 999);
    return { from, to, groupBy: "month" as const };
  }
  const from = start ? new Date(start) : new Date(now);
  const to = end ? new Date(end) : new Date(now);
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  return { from, to, groupBy: "day" as const };
};

export default function Page() {
  const [filterType, setFilterType] = useState<FilterType>("daily");
  const [customStart, setCustomStart] = useState(formatDate(new Date()));
  const [customEnd, setCustomEnd] = useState(formatDate(new Date()));
  const [showFilters, setShowFilters] = useState(false);
  const [summary, setSummary] = useState<SalesSummary>({ totalEarned: 0, buckets: [] });
  const [last7, setLast7] = useState<Bucket[]>([]);
  const [todayEarned, setTodayEarned] = useState(0);
  const [yesterdayEarned, setYesterdayEarned] = useState(0);

  useEffect(() => {
    const { from, to, groupBy } = buildRange(filterType, customStart, customEnd);
    const fetchSummary = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/billing/summary/sales?from=${from.toISOString()}&to=${to.toISOString()}&groupBy=${groupBy}`,
        { credentials: "include" }
      );
      const json = await res.json();
      if (json?.success) {
        setSummary(json.data);
      }
    };
    fetchSummary();
  }, [filterType, customStart, customEnd]);

  useEffect(() => {
    const { from, to } = buildRange("daily");
    const fetchToday = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/billing/summary/sales?from=${from.toISOString()}&to=${to.toISOString()}&groupBy=day`,
        { credentials: "include" }
      );
      const json = await res.json();
      if (json?.success) {
        setTodayEarned(Number(json.data?.totalEarned ?? 0));
      }
    };
    fetchToday();
  }, []);

  useEffect(() => {
    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - 1);
    from.setHours(0, 0, 0, 0);
    const to = new Date(now);
    to.setDate(now.getDate() - 1);
    to.setHours(23, 59, 59, 999);
    const fetchYesterday = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/billing/summary/sales?from=${from.toISOString()}&to=${to.toISOString()}&groupBy=day`,
        { credentials: "include" }
      );
      const json = await res.json();
      if (json?.success) {
        setYesterdayEarned(Number(json.data?.totalEarned ?? 0));
      }
    };
    fetchYesterday();
  }, []);

  useEffect(() => {
    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - 6);
    from.setHours(0, 0, 0, 0);
    const to = new Date(now);
    to.setHours(23, 59, 59, 999);
    const fetchLast7 = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/billing/summary/sales?from=${from.toISOString()}&to=${to.toISOString()}&groupBy=day`,
        { credentials: "include" }
      );
      const json = await res.json();
      if (json?.success) {
        const buckets = new Map<string, number>();
        const list = (json.data?.buckets || []) as Bucket[];
        for (const b of list) {
          buckets.set(b.key, b.amount);
        }
        const filled: Bucket[] = [];
        for (let i = 0; i < 7; i += 1) {
          const d = new Date(from);
          d.setDate(from.getDate() + i);
          const key = formatDate(d);
          filled.push({ key, amount: buckets.get(key) ?? 0 });
        }
        setLast7(filled);
      }
    };
    fetchLast7();
  }, []);

  const maxVal = Math.max(...last7.map((b) => b.amount), 1);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="text-orange-600" size={24} />
          Money Earned Today
        </h2>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Calendar size={18} />
        </button>
      </div>

      <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-6">
        <div className="text-2xl font-bold text-gray-900">
          ${Number(todayEarned).toFixed(2)}
        </div>
        <div className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Total earned today</div>
        <div className="text-xs text-gray-600 mt-1">
          {yesterdayEarned > 0
            ? `Sales are up by ${(((todayEarned - yesterdayEarned) / yesterdayEarned) * 100).toFixed(1)}% today`
            : todayEarned > 0
              ? "Sales are up today"
              : "No sales yet today"}
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 border border-gray-200 rounded-xl bg-gray-50 space-y-3">
          <div className="flex gap-3 flex-wrap">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom Range</option>
            </select>
            {filterType === "custom" && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
                <span className="text-sm text-gray-500">to</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            )}
          </div>
          <div className="text-sm text-gray-600">
            Filtered total: ${Number(summary.totalEarned).toFixed(2)}
          </div>
        </div>
      )}

      <div className="mb-4 text-sm font-semibold text-gray-900">Last 7 Days Sales</div>
      <div className="flex items-end gap-2 h-32">
        {last7.map((b) => (
          <div key={b.key} className="flex-1 flex flex-col items-center gap-2">
            <div
              className="w-full bg-orange-200 rounded-md"
              style={{ height: `${(b.amount / maxVal) * 100}%` }}
            />
            <div className="text-[10px] text-gray-500">{b.key.slice(5)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
