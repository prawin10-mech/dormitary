"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import {
  BarChart3,
  CalendarDays,
  BedDouble,
  Wallet,
  Loader2,
  TrendingUp,
} from "lucide-react";

interface Breakdown {
  label: string;
  count: number;
}
interface Analytics {
  kpis: {
    totalBookings: number;
    monthBookings: number;
    occupied: number;
    totalBeds: number;
    available: number;
    occupancyPct: number;
    acBeds: number;
    revenue: number;
    monthRevenue: number;
    pricePerBooking: number;
  };
  daily: { date: string; label: string; count: number }[];
  payment: Breakdown[];
  period: Breakdown[];
}

const inr = (n: number) =>
  "₹" + n.toLocaleString("en-IN");

const BAR_COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"];

export default function AnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/analytics", { credentials: "include" });
        if (res.status === 401) return router.replace("/login");
        if (res.status === 403) {
          if (active) setError("Analytics is available to admins only.");
          return;
        }
        if (!res.ok) throw new Error("Failed to load analytics");
        const json = await res.json();
        if (active) setData(json);
      } catch (e: any) {
        if (active) setError(e.message || "Something went wrong");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
        <div className="mb-5 flex items-center gap-2">
          <BarChart3 className="text-indigo-600" size={24} />
          <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
        </div>

        {loading ? (
          <div className="flex h-60 items-center justify-center text-slate-400">
            <Loader2 className="mr-2 animate-spin" /> Loading analytics…
          </div>
        ) : error ? (
          <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-300 text-slate-500">
            {error}
          </div>
        ) : data ? (
          <div className="space-y-5">
            {/* KPI cards */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Kpi
                icon={<BarChart3 size={18} />}
                label="Total bookings"
                value={data.kpis.totalBookings.toLocaleString("en-IN")}
                tone="indigo"
              />
              <Kpi
                icon={<CalendarDays size={18} />}
                label="This month"
                value={data.kpis.monthBookings.toLocaleString("en-IN")}
                tone="sky"
              />
              <Kpi
                icon={<BedDouble size={18} />}
                label="Occupancy"
                value={`${data.kpis.occupancyPct}%`}
                sub={`${data.kpis.occupied}/${data.kpis.totalBeds} beds`}
                tone="emerald"
              />
              <Kpi
                icon={<Wallet size={18} />}
                label="Est. revenue"
                value={inr(data.kpis.revenue)}
                sub={`${inr(data.kpis.monthRevenue)} this month`}
                tone="amber"
              />
            </div>

            {/* Bookings over time + occupancy */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
              <Card
                title="Bookings — last 14 days"
                icon={<TrendingUp size={18} className="text-indigo-600" />}
              >
                <BookingsBarChart daily={data.daily} />
              </Card>

              <Card title="Bed occupancy">
                <OccupancyDonut
                  occupied={data.kpis.occupied}
                  total={data.kpis.totalBeds}
                  pct={data.kpis.occupancyPct}
                />
                <div className="mt-4 flex justify-center gap-5 text-sm">
                  <Legend color="#4f46e5" label={`Occupied ${data.kpis.occupied}`} />
                  <Legend color="#e2e8f0" label={`Free ${data.kpis.available}`} />
                </div>
              </Card>
            </div>

            {/* Breakdowns */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Card title="Payment method">
                <BreakdownBars rows={data.payment} />
              </Card>
              <Card title="Stay type">
                <BreakdownBars rows={data.period} />
              </Card>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

/* ---------------------------------- bits --------------------------------- */

const toneMap: Record<string, string> = {
  indigo: "bg-indigo-50 text-indigo-600",
  sky: "bg-sky-50 text-sky-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
};

function Kpi({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone: keyof typeof toneMap | string;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center gap-2">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneMap[tone] || toneMap.indigo}`}>
          {icon}
        </span>
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-600">
        {icon} {title}
      </h2>
      {children}
    </section>
  );
}

function BookingsBarChart({
  daily,
}: {
  daily: { label: string; count: number }[];
}) {
  const max = Math.max(1, ...daily.map((d) => d.count));
  return (
    <div>
      <div className="flex h-44 items-end gap-1.5">
        {daily.map((d, i) => (
          <div key={i} className="group flex flex-1 flex-col items-center justify-end">
            <span className="mb-1 text-[10px] font-semibold text-slate-500 opacity-0 transition group-hover:opacity-100">
              {d.count}
            </span>
            <div
              className="w-full rounded-t-md bg-indigo-500 transition-all hover:bg-indigo-600"
              style={{ height: `${Math.max(2, (d.count / max) * 100)}%` }}
              title={`${d.label}: ${d.count}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5">
        {daily.map((d, i) => (
          <span
            key={i}
            className="flex-1 text-center text-[9px] text-slate-400"
          >
            {i % 2 === 0 ? d.label.split(" ")[0] : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

function OccupancyDonut({
  occupied,
  total,
  pct,
}: {
  occupied: number;
  total: number;
  pct: number;
}) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const filled = (pct / 100) * c;
  return (
    <div className="relative mx-auto h-40 w-40">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#e2e8f0" strokeWidth="16" />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="#4f46e5"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${c - filled}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-800">{pct}%</span>
        <span className="text-xs text-slate-500">{occupied}/{total}</span>
      </div>
    </div>
  );
}

function BreakdownBars({ rows }: { rows: Breakdown[] }) {
  const total = rows.reduce((s, r) => s + r.count, 0);
  if (!total) {
    return <p className="text-sm text-slate-400">No data yet.</p>;
  }
  return (
    <div className="space-y-3">
      {rows.map((r, i) => {
        const pct = Math.round((r.count / total) * 100);
        return (
          <div key={r.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{r.label}</span>
              <span className="text-slate-500">
                {r.count} <span className="text-slate-400">({pct}%)</span>
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-slate-600">
      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
