"use client";

import Header from "@/components/Header";
import PageTitle from "@/components/PageTitle";
import { useGlobalContext } from "@/lib/useGlobalContext";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { HistoryRecord } from "@/types";
import UserBedDetailsCard from "@/components/UserBedDetailsCard";
import { PRICE_PER_BOOKING } from "@/lib/pricing";
import { ChevronDown, History as HistoryIcon, CalendarDays } from "lucide-react";

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
const monthName = (m: number) => dayjs().month(m - 1).format("MMMM");
const countIn = (node: any): number =>
  Array.isArray(node)
    ? node.length
    : Object.values(node || {}).reduce((s: number, n) => s + countIn(n), 0);
const desc = (o: object) => Object.keys(o).map(Number).sort((a, b) => b - a);

export default function History() {
  const { history, getBedHistory } = useGlobalContext();
  const [openYear, setOpenYear] = useState<number | null>(null);
  const [openMonth, setOpenMonth] = useState<number | null>(null);
  const [openDay, setOpenDay] = useState<number | null>(null);

  useEffect(() => {
    getBedHistory();
  }, [getBedHistory]);

  // Open the most recent year/month by default once data arrives.
  useEffect(() => {
    if (!history || openYear !== null) return;
    const years = desc(history);
    if (!years.length) return;
    setOpenYear(years[0]);
    const months = desc(history[years[0]] || {});
    if (months.length) setOpenMonth(months[0]);
  }, [history, openYear]);

  const hasData = history && Object.keys(history).length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6">
        <PageTitle
          icon={<HistoryIcon size={20} />}
          title="Booking history"
          subtitle="Every check-in, grouped by year, month and day"
        />

        {!hasData ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-300 text-slate-400">
            No history data available.
          </div>
        ) : (
          <div className="space-y-3">
            {desc(history).map((year) => {
              const months = history[year];
              const yOpen = openYear === year;
              return (
                <section key={year} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                  <Row
                    open={yOpen}
                    onClick={() => {
                      setOpenYear(yOpen ? null : year);
                      setOpenMonth(null);
                      setOpenDay(null);
                    }}
                    title={<span className="text-lg font-bold text-slate-800">{year}</span>}
                    count={countIn(months)}
                  />
                  {yOpen && (
                    <div className="space-y-2 border-t border-slate-100 bg-slate-50/60 p-2 sm:p-3">
                      {desc(months).map((month) => {
                        const days = months[month];
                        const mOpen = openMonth === month;
                        const mCount = countIn(days);
                        return (
                          <div key={month} className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
                            <Row
                              open={mOpen}
                              onClick={() => {
                                setOpenMonth(mOpen ? null : month);
                                setOpenDay(null);
                              }}
                              title={<span className="font-semibold text-slate-700">{monthName(month)} {year}</span>}
                              count={mCount}
                            />
                            {mOpen && (
                              <div className="border-t border-slate-100">
                                {desc(days).map((day) => {
                                  const records: HistoryRecord[] = days[day];
                                  const dOpen = openDay === day;
                                  return (
                                    <div key={day} className="border-b border-slate-100 last:border-b-0">
                                      <Row
                                        open={dOpen}
                                        onClick={() => setOpenDay(dOpen ? null : day)}
                                        title={
                                          <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                            <CalendarDays size={15} className="text-slate-400" />
                                            {day} {monthName(month)}
                                          </span>
                                        }
                                        count={records.length}
                                        compact
                                      />
                                      {dOpen && <DayTable records={records} />}
                                    </div>
                                  );
                                })}
                                <div className="flex justify-between bg-indigo-50/60 px-4 py-3 text-sm font-semibold text-indigo-900">
                                  <span>{monthName(month)} total</span>
                                  <span>{inr(mCount * PRICE_PER_BOOKING)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function Row({
  open,
  onClick,
  title,
  count,
  compact,
}: {
  open: boolean;
  onClick: () => void;
  title: React.ReactNode;
  count: number;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      className={`flex w-full items-center justify-between gap-3 text-left transition hover:bg-indigo-50/50 ${
        compact ? "px-4 py-2.5" : "px-4 py-3.5"
      }`}
    >
      {title}
      <span className="flex items-center gap-3">
        <span className="hidden text-sm font-medium text-slate-500 sm:inline">
          {inr(count * PRICE_PER_BOOKING)}
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
          {count} {count === 1 ? "check-in" : "check-ins"}
        </span>
        <ChevronDown
          size={18}
          className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </span>
    </button>
  );
}

function DayTable({ records }: { records: HistoryRecord[] }) {
  return (
    <div className="bg-slate-50/60 px-2 pb-3 sm:px-4">
      {/* Mobile list */}
      <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white ring-1 ring-slate-200 sm:hidden">
        {records.map((r, i) => (
          <li key={`${r.bed?._id}-${i}`} className="flex items-center justify-between gap-3 px-3 py-2.5">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-indigo-600">
                <UserBedDetailsCard bed={r}>{r.name || "Guest"}</UserBedDetailsCard>
              </div>
              <p className="text-xs text-slate-500">
                Bed {r.bed?.bed} · {r.bed?.type} · {r.phone}
              </p>
            </div>
            <span className="text-sm font-semibold text-slate-700">{inr(PRICE_PER_BOOKING)}</span>
          </li>
        ))}
      </ul>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-xl bg-white ring-1 ring-slate-200 sm:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["#", "Name", "Phone", "Bed", "Type", "Check in", "Amount"].map((h) => (
                <th key={h} className={`px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-500 ${h === "Amount" ? "text-right" : "text-left"}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((r, i) => (
              <tr key={`${r.bed?._id}-${i}`} className="hover:bg-slate-50">
                <td className="px-4 py-2.5 text-slate-400">{i + 1}</td>
                <td className="px-4 py-2.5 font-medium text-indigo-600">
                  <UserBedDetailsCard bed={r}>{r.name || "Guest"}</UserBedDetailsCard>
                </td>
                <td className="px-4 py-2.5 text-slate-500">{r.phone}</td>
                <td className="px-4 py-2.5 text-slate-500">{r.bed?.bed}</td>
                <td className="px-4 py-2.5 text-slate-500">{r.bed?.type}</td>
                <td className="px-4 py-2.5 text-slate-500">{dayjs(r.createdAt).format("hh:mm A")}</td>
                <td className="px-4 py-2.5 text-right font-medium text-slate-700">{inr(PRICE_PER_BOOKING)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50">
            <tr>
              <td colSpan={6} className="px-4 py-2.5 text-right font-semibold text-slate-700">Day total</td>
              <td className="px-4 py-2.5 text-right font-bold text-slate-900">
                {inr(records.length * PRICE_PER_BOOKING)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
