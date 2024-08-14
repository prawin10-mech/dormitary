"use client";

import Header from "@/components/Header";
import { useGlobalContext } from "@/lib/useGlobalContext";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { HistoryResponse, HistoryRecord, Bed } from "@/types";

dayjs.extend(advancedFormat);

export default function History() {
  const { history, getBedHistory } = useGlobalContext();
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedDayData, setSelectedDayData] = useState<
    HistoryRecord[] | null
  >(null);

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
  };

  const handleMonthClick = (month: number) => {
    setExpandedMonth(expandedMonth === month ? null : month);
    setSelectedDay(null);
    setSelectedDayData(null);
  };

  const handleDayClick = (day: number, records: HistoryRecord[]) => {
    if (selectedDay === day) {
      setSelectedDay(null);
      setSelectedDayData(null);
    } else {
      setSelectedDay(day);
      setSelectedDayData(records);
    }
  };

  return (
    <div className="p-4">
      <div className="w-full bg-white shadow-lg rounded-lg mb-4 md:mb-0">
        <Header />
      </div>
      <div className="bg-gray-100 p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-4">History</h1>
        {history && Object.keys(history).length > 0 ? (
          Object.keys(history).map((yearStr) => {
            const year = parseInt(yearStr, 10);
            const months = history[year];
            return (
              <div key={year} className="mb-4">
                <div
                  className="p-4 border rounded-lg cursor-pointer hover:bg-gray-200"
                  onClick={() => handleYearClick(year)}
                >
                  <h2 className="text-xl font-semibold">{year}</h2>
                </div>
                {expandedYear === year && (
                  <div className="pl-4">
                    {Object.keys(months).map((monthStr) => {
                      const month = parseInt(monthStr, 10);
                      const days = months[month];
                      return (
                        <div key={month}>
                          <div
                            className="p-4 border rounded-lg cursor-pointer hover:bg-gray-200"
                            onClick={() => handleMonthClick(month)}
                          >
                            <h2 className="text-lg font-semibold">
                              {getMonthName(month)}-{year}
                            </h2>
                          </div>
                          {expandedMonth === month && (
                            <div className="pl-4">
                              {Object.keys(days).map((dayStr) => {
                                const day = parseInt(dayStr, 10);
                                const records = days[day];
                                return (
                                  <div key={day} className="mb-2">
                                    <div
                                      className="p-4 border rounded-lg cursor-pointer hover:bg-gray-200"
                                      onClick={() =>
                                        handleDayClick(day, records)
                                      }
                                    >
                                      <h3 className="text-md font-medium">
                                        {day}-{getMonthName(month)}-{year}
                                      </h3>
                                    </div>
                                    {selectedDay === day && selectedDayData && (
                                      <div className="mt-4 bg-white shadow-md rounded-lg">
                                        <div className="overflow-x-auto">
                                          <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                              <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                  Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                  Phone
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                  Bed
                                                </th>
                                              </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                              {selectedDayData.map((record) => (
                                                <tr key={record.bed._id}>
                                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {record.name}
                                                  </td>
                                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {record.phone}
                                                  </td>
                                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {record.bed.bed}
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
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
                )}
              </div>
            );
          })
        ) : (
          <p>No history data available.</p>
        )}
      </div>
    </div>
  );
}
