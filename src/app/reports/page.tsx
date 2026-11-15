"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import Header from "@/components/Header";
import PageTitle from "@/components/PageTitle";
import {
  FileSpreadsheet,
  Download,
  Printer,
  Loader2,
  Receipt,
  Users,
  Wallet,
  AlertCircle,
} from "lucide-react";

interface Tally {
  label: string;
  count: number;
  amount: number;
}
interface Row {
  id: string;
  name: string;
  number: string;
  bed: string;
  type: string;
  period: string;
  paymentType: string;
  purpose: string;
  checkIn: string;
  checkOut?: string;
  amount: number;
}
interface Report {
  from: string;
  to: string;
  summary: {
    bookings: number;
    guests: number;
    total: number;
    collected: number;
    pending: number;
    pricePerBooking: number;
  };
  byPayment: Tally[];
  byPeriod: Tally[];
  byBedType: Tally[];
  rows: Row[];
}

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
const fmt = (d: dayjs.Dayjs) => d.format("YYYY-MM-DD");

const PRESETS: { key: string; label: string; range: () => [string, string] }[] = [
  { key: "today", label: "Today", range: () => [fmt(dayjs()), fmt(dayjs())] },
  { key: "7d", label: "Last 7 days", range: () => [fmt(dayjs().subtract(6, "day")), fmt(dayjs())] },
  { key: "month", label: "This month", range: () => [fmt(dayjs().startOf("month")), fmt(dayjs())] },
  {
    key: "lastmonth",
    label: "Last month",
    range: () => {
      const m = dayjs().subtract(1, "month");
      return [fmt(m.startOf("month")), fmt(m.endOf("month"))];
    },
  },
];

const payTone: Record<string, string> = {
  UPI: "bg-sky-100 text-sky-700",
  Cash: "bg-emerald-100 text-emerald-700",
  "Not Paid": "bg-rose-100 text-rose-700",
};

export default function ReportsPage() {
  const router = useRouter();
  const [[from, to], setRange] = useState<[string, string]>(PRESETS[2].range());
  const [preset, setPreset] = useState<string>("month");
  const [data, setData] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/reports?from=${from}&to=${to}`, {
        credentials: "include",
      });
      if (res.status === 401) return router.replace("/login");
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Failed to load report");
      setData(json);
    } catch (e: any) {
      setData(null);
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [from, to, router]);

  useEffect(() => {
    load();
  }, [load]);

  const rangeLabel = useMemo(() => {
    const a = dayjs(from);
    const b = dayjs(to);
    return from === to
      ? a.format("DD MMM YYYY")
      : `${a.format("DD MMM YYYY")} – ${b.format("DD MMM YYYY")}`;
  }, [from, to]);

  const downloadCsv = () => {
    if (!data) return;
    const header = ["S. No", "Name", "Phone", "Bed", "Type", "Stay", "Payment", "Purpose", "Check in", "Check out", "Amount"];
    const esc = (v: string | number) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = data.rows.map((r, i) =>
      [
        i + 1,
        r.name,
        r.number,
        r.bed,
        r.type,
        r.period,
        r.paymentType,
        r.purpose,
        dayjs(r.checkIn).format("DD MMM YYYY hh:mm A"),
        r.checkOut ? dayjs(r.checkOut).format("DD MMM YYYY hh:mm A") : "",
        r.amount,
      ]
        .map(esc)
        .join(",")
    );
    lines.push(["", "", "", "", "", "", "", "", "", "Total", data.summary.total].map(esc).join(","));
    const blob = new Blob(["﻿" + [header.map(esc).join(","), ...lines].join("\r\n")], {
      type: "text/csv;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `bookings-report_${from}_to_${to}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="print:hidden">
        <Header />
      </div>
      <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
        <PageTitle
          icon={<FileSpreadsheet size={20} />}
          title="Reports"
          subtitle={`Bookings and collections · ${rangeLabel}`}
          actions={
            <>
              <button
                onClick={downloadCsv}
                disabled={!data || data.rows.length === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
              >
                <Download size={16} /> Download CSV
              </button>
              <button
                onClick={() => window.print()}
                disabled={!data}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <Printer size={16} /> Print
              </button>
            </>
          }
        />

        {/* Range picker */}
        <section className="mb-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 print:hidden">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                onClick={() => {
                  setPreset(p.key);
                  setRange(p.range());
                }}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  preset === p.key
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:max-w-md">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              From
              <input
                type="date"
                value={from}
                max={to}
                onChange={(e) => {
                  setPreset("custom");
                  setRange([e.target.value, to]);
                }}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-normal normal-case text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              To
              <input
                type="date"
                value={to}
                min={from}
                onChange={(e) => {
                  setPreset("custom");
                  setRange([from, e.target.value]);
                }}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-normal normal-case text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>
          </div>
        </section>

        {loading ? (
          <div className="flex h-60 items-center justify-center text-slate-400">
            <Loader2 className="mr-2 animate-spin" /> Building report…
          </div>
        ) : error ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 text-slate-500">
            <AlertCircle size={22} />
            {error}
          </div>
        ) : data ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat icon={<Receipt size={18} />} label="Bookings" value={String(data.summary.bookings)} tone="bg-indigo-50 text-indigo-600" />
              <Stat icon={<Users size={18} />} label="Unique guests" value={String(data.summary.guests)} tone="bg-sky-50 text-sky-600" />
              <Stat icon={<Wallet size={18} />} label="Collected" value={inr(data.summary.collected)} sub={`of ${inr(data.summary.total)} billed`} tone="bg-emerald-50 text-emerald-600" />
              <Stat icon={<AlertCircle size={18} />} label="Pending" value={inr(data.summary.pending)} tone="bg-rose-50 text-rose-600" />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <TallyCard title="By payment" rows={data.byPayment} />
              <TallyCard title="By stay type" rows={data.byPeriod} />
              <TallyCard title="By bed type" rows={data.byBedType} />
            </div>

            <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <h2 className="border-b border-slate-100 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-slate-600">
                Bookings ({data.rows.length})
              </h2>
              {data.rows.length === 0 ? (
                <p className="p-8 text-center text-sm text-slate-400">
                  No bookings in this period.
                </p>
              ) : (
                <>
                  {/* Mobile list */}
                  <ul className="divide-y divide-slate-100 md:hidden print:hidden">
                    {data.rows.map((r) => (
                      <li key={r.id} className="flex items-start justify-between gap-3 px-4 py-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-800">{r.name || "Guest"}</p>
                          <p className="text-xs text-slate-500">
                            Bed {r.bed} · {r.type} · {r.period} · {r.number}
                          </p>
                          <p className="text-xs text-slate-400">
                            {dayjs(r.checkIn).format("DD MMM, hh:mm A")}
                          </p>
                        </div>
                        <div className="flex flex-shrink-0 flex-col items-end gap-1">
                          <span className="font-semibold text-slate-800">{inr(r.amount)}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${payTone[r.paymentType] || "bg-slate-100 text-slate-600"}`}>
                            {r.paymentType}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Desktop / print table */}
                  <div className="hidden overflow-x-auto md:block print:block">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          {["#", "Name", "Phone", "Bed", "Stay", "Check in", "Payment", "Amount"].map((h) => (
                            <th key={h} className={`px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 ${h === "Amount" ? "text-right" : "text-left"}`}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data.rows.map((r, i) => (
                          <tr key={r.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                            <td className="px-4 py-3 font-medium text-slate-800">{r.name || "Guest"}</td>
                            <td className="px-4 py-3 text-slate-500">{r.number}</td>
                            <td className="px-4 py-3 text-slate-500">{r.bed} <span className="text-xs text-slate-400">({r.type})</span></td>
                            <td className="px-4 py-3 text-slate-500">{r.period}</td>
                            <td className="px-4 py-3 text-slate-500">{dayjs(r.checkIn).format("DD MMM YYYY, hh:mm A")}</td>
                            <td className="px-4 py-3">
                              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${payTone[r.paymentType] || "bg-slate-100 text-slate-600"}`}>
                                {r.paymentType}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-slate-800">{inr(r.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-50">
                        <tr>
                          <td colSpan={7} className="px-4 py-3 text-right font-semibold text-slate-700">Total</td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900">{inr(data.summary.total)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 bg-slate-50 px-4 py-3 font-semibold text-slate-800 md:hidden print:hidden">
                    <span>Total</span>
                    <span>{inr(data.summary.total)}</span>
                  </div>
                </>
              )}
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function Stat({
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
  tone: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center gap-2">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}>{icon}</span>
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function TallyCard({ title, rows }: { title: string; rows: Tally[] }) {
  const total = rows.reduce((s, r) => s + r.count, 0);
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      {total === 0 ? (
        <p className="text-sm text-slate-400">No data.</p>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((r) => {
            const pct = Math.round((r.count / total) * 100);
            return (
              <li key={r.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{r.label}</span>
                  <span className="text-slate-500">
                    {r.count} · {inr(r.amount)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
