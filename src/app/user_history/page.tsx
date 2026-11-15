"use client";

import Header from "@/components/Header";
import PageTitle from "@/components/PageTitle";
import dayjs from "dayjs";
import UserBedDetailsCard from "@/components/UserBedDetailsCard";
import { useGlobalContext } from "@/lib/useGlobalContext";
import React, { useState } from "react";
import { Loader2, Search, Users } from "lucide-react";

const when = (d?: string) => (d ? dayjs(d).format("DD MMM YYYY, hh:mm A") : "N/A");

export default function Page() {
  const { bookings, getUserBookings } = useGlobalContext();
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);

  const fetchBookings = async () => {
    setError("");
    // Accept pasted values with spaces / +91 and match on the last 10 digits.
    const digits = phoneNumber.replace(/\D/g, "").slice(-10);
    if (digits.length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    setLoading(true);
    try {
      await getUserBookings({ number: digits });
      setSearched(true);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const guest = bookings[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-6">
        <PageTitle
          icon={<Users size={20} />}
          title="User history"
          subtitle="Look up every stay for a guest by phone number"
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchBookings();
          }}
          className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
        >
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                inputMode="numeric"
                placeholder="10-digit phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-base focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
        </form>

        {bookings.length > 0 ? (
          <section className="mt-5 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
              <div>
                <p className="font-semibold text-slate-800">{guest?.name || "Guest"}</p>
                <p className="text-xs text-slate-500">{guest?.number}</p>
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                {bookings.length} {bookings.length === 1 ? "stay" : "stays"}
              </span>
            </div>

            {/* Mobile list */}
            <ul className="divide-y divide-slate-100 sm:hidden">
              {bookings.map((b: any, i: number) => (
                <li key={b._id || i} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-indigo-600">
                      <UserBedDetailsCard bed={b}>Bed {b?.bed?.bed || "-"}</UserBedDetailsCard>
                    </span>
                    <span className="text-xs text-slate-400">#{i + 1}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">In: {when(b.createdAt)}</p>
                  <p className="text-xs text-slate-500">Out: {when(b.checkOutAt || (b.createdAt && dayjs(b.createdAt).add(1, "day").toISOString()))}</p>
                </li>
              ))}
            </ul>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {["#", "Name", "Bed", "Phone", "Check in", "Check out"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((b: any, i: number) => (
                    <tr key={b._id || i} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-indigo-600">
                        <UserBedDetailsCard bed={b}>{b.name || "Guest"}</UserBedDetailsCard>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{b?.bed?.bed || "-"}</td>
                      <td className="px-4 py-3 text-slate-500">{b.number}</td>
                      <td className="px-4 py-3 text-slate-500">{when(b.createdAt)}</td>
                      <td className="px-4 py-3 text-slate-500">{when(b.checkOutAt || (b.createdAt && dayjs(b.createdAt).add(1, "day").toISOString()))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <div className="mt-5 flex h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 text-slate-400">
            <Users size={24} />
            {searched ? "No bookings found for this number." : "Search by phone number to see a guest's stays."}
          </div>
        )}
      </main>
    </div>
  );
}
