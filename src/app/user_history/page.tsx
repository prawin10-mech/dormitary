"use client";

import Header from "@/components/Header";
import dayjs from "dayjs";
import UserBedDetailsCard from "@/components/UserBedDetailsCard";
import { useGlobalContext } from "@/lib/useGlobalContext";
import React, { useState } from "react";

interface Booking {
  id: string;
  date: string;
  service: string;
  status: string;
}

export default function Page() {
  const { bookings, getUserBookings } = useGlobalContext();
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchBookings = async () => {
    setError(""); // Clear any previous error messages
    setLoading(true); // Start loading
    try {
      // Accept pasted values with spaces / +91 and match on the last 10 digits.
      const digits = phoneNumber.replace(/\D/g, "").slice(-10);
      if (digits.length !== 10) {
        setError("Please enter a valid 10-digit phone number.");
        setLoading(false);
        return;
      }
      await getUserBookings({ number: digits });
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-6">
        <h1 className="mb-4 text-2xl font-bold text-slate-800">Booking lookup</h1>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="tel"
            inputMode="numeric"
            placeholder="Enter 10-digit phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchBookings()}
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-base focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={fetchBookings}
            disabled={loading}
            className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Loading…" : "Search"}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}

        {bookings.length > 0 ? (
          <div className="mt-5 overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    {["S. No", "Name", "Bed", "Phone", "Check in", "Check out"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((booking, index) => (
                    <tr key={booking._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-indigo-600 underline-offset-2 hover:underline">
                        <UserBedDetailsCard bed={booking}>{booking.name}</UserBedDetailsCard>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">{booking?.bed?.bed || "-"}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{booking.number}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {booking.createdAt ? dayjs(booking.createdAt).format("DD MMM YYYY hh:mm A") : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {booking.createdAt ? dayjs(booking.createdAt).add(1, "day").format("DD MMM YYYY hh:mm A") : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="mt-5 flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-300 text-slate-400">
            No bookings to show. Search by phone number.
          </div>
        )}
      </main>
    </div>
  );
}
