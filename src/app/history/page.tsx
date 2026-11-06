"use client";

import Header from "@/components/Header";
import { useGlobalContext } from "@/lib/useGlobalContext";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { HistoryResponse, HistoryRecord, Bed } from "@/types";
import UserCard, { IUserCard } from "@/components/UserCard";
import UserBedDetailsCard from "@/components/UserBedDetailsCard";

dayjs.extend(advancedFormat);

export default function History() {
  const { history, getBedHistory } = useGlobalContext();
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedDayData, setSelectedDayData] = useState<
    HistoryRecord[] | null
  >(null);
  const [dayTotal, setDayTotal] = useState<number | null>(null);
  const [monthTotal, setMonthTotal] = useState<number | null>(null);

  useEffect(() => {
    getBedHistory();
  }, [getBedHistory]);

  const getMonthName = (monthNumber: number): string => {
    const date = dayjs().month(monthNumber - 1); // Months are 0-indexed in Day.js
    return date.format("MMMM");
  };

  const handleYearClick = (year: number) => {
    setExpandedYear(expandedYear === year ? null : year);
    setExpandedMonth(null);
    setSelectedDay(null);
    setSelectedDayData(null);
    setMonthTotal(null);
  };

  const handleMonthClick = (month: number) => {
    setExpandedMonth(expandedMonth === month ? null : month);
    setSelectedDay(null);
    setSelectedDayData(null);
    if (expandedMonth !== month) {
      const days = history[expandedYear!][month];
      const total = Object.values(days)
        .flat()
        .reduce((sum: number) => sum + 200, 0);
      setMonthTotal(total);
    } else {
      setMonthTotal(null);
    }
  };

  const handleDayClick = (day: number, records: HistoryRecord[]) => {
    if (selectedDay === day) {
      setSelectedDay(null);
      setSelectedDayData(null);
      setDayTotal(null);
    } else {
      setSelectedDay(day);
      setSelectedDayData(records);
      const total = records.reduce((sum, record) => sum + 200, 0);
      setDayTotal(total);
    }
  };

  const rowBase =
    "flex items-center justify-between p-4 rounded-xl cursor-pointer bg-white ring-1 ring-slate-200 hover:ring-indigo-300 hover:bg-indigo-50/40 transition";

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6">
        <h1 className="mb-4 text-2xl font-bold text-slate-800">History</h1>
        {history && Object.keys(history).length > 0 ? (
          <div className="space-y-3">
            {Object.keys(history).map((yearStr) => {
              const year = parseInt(yearStr, 10);
              const months = history[year];
              return (
                <div key={year}>
                  <div className={rowBase} onClick={() => handleYearClick(year)}>
                    <h2 className="text-lg font-semibold text-slate-800">{year}</h2>
                    <span className="text-slate-400">{expandedYear === year ? "−" : "+"}</span>
                  </div>
                  {expandedYear === year && (
                    <div className="mt-2 space-y-2 pl-3 sm:pl-4">
                      {Object.keys(months).map((monthStr) => {
                        const month = parseInt(monthStr, 10);
                        const days = months[month];
                        return (
                          <div key={month}>
                            <div className={rowBase} onClick={() => handleMonthClick(month)}>
                              <h2 className="font-semibold text-slate-700">
                                {getMonthName(month)} {year}
                              </h2>
                              <span className="text-slate-400">{expandedMonth === month ? "−" : "+"}</span>
                            </div>
                            {expandedMonth === month && (
                              <div className="mt-2 space-y-2 pl-3 sm:pl-4">
                                {Object.keys(days).map((dayStr) => {
                                  const day = parseInt(dayStr, 10);
                                  const records = days[day];
                                  return (
                                    <div key={day}>
                                      <div className={rowBase} onClick={() => handleDayClick(day, records)}>
                                        <h3 className="font-medium text-slate-700">
                                          {day} {getMonthName(month)} {year}
                                        </h3>
                                        <span className="text-xs text-slate-400">{records.length} check-ins</span>
                                      </div>
                                      {selectedDay === day && selectedDayData && (
                                        <div className="mt-2 overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
                                          <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-slate-200">
                                              <thead className="bg-slate-50">
                                                <tr>
                                                  {["S. No", "Name", "Phone", "Bed", "Type", "Amount"].map((h) => (
                                                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                                      {h}
                                                    </th>
                                                  ))}
                                                </tr>
                                              </thead>
                                              <tbody className="divide-y divide-slate-100">
                                                {selectedDayData.map((record, index) => (
                                                  <tr key={record.bed._id} className="hover:bg-slate-50">
                                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{index + 1}</td>
                                                    <td className="px-4 py-3 text-sm font-medium text-indigo-600 underline-offset-2 hover:underline">
                                                      <UserBedDetailsCard bed={record}>{record.name}</UserBedDetailsCard>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-slate-500">{record.phone}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-500">{record.bed.bed}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-500">{record.bed.type}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-500">₹200</td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                            <div className="p-4 text-right font-bold text-slate-800">
                                              Total for {day} {getMonthName(month)} {year}: ₹{dayTotal}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                                {monthTotal !== null && (
                                  <div className="p-3 text-right font-bold text-slate-800">
                                    Total for {getMonthName(month)} {year}: ₹{monthTotal}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-300 text-slate-400">
            No history data available.
          </div>
        )}
      </main>
    </div>
  );
}
