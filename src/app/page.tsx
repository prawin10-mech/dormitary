"use client";

import { useEffect } from "react";
import NewUserForm from "./components/NewUserForm";
import Bed from "./components/Bed";
import Header from "@/components/Header";
import BedStats from "./components/BedStats";
import { useGlobalContext } from "@/lib/useGlobalContext";
import useForegroundNotifications from "../hooks/userForegroundNotifications";
import { UserPlus, BedDouble } from "lucide-react";

export default function Home() {
  const { beds, getBeds } = useGlobalContext();

  useEffect(() => {
    getBeds();
  }, [getBeds]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .catch(() => {});
    }
  }, []);

  useForegroundNotifications();

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6">
        <BedStats />

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,420px)_1fr]">
          {/* Check-in form */}
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
              <UserPlus size={20} className="text-indigo-600" />
              New check-in
            </h2>
            <NewUserForm />
          </section>

          {/* Beds */}
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
              <BedDouble size={20} className="text-indigo-600" />
              Beds
            </h2>

            {beds.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-400">
                <BedDouble size={28} />
                <p className="mt-2 text-sm">No beds to show yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                {beds.map((bed: any) => (
                  <Bed
                    key={bed._id}
                    name={bed.bed}
                    occupied={bed.isOccupied}
                    endsIn={bed.occupiedDate}
                    type={bed.type}
                    bed={bed}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
