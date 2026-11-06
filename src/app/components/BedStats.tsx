"use client";

import React from "react";
import { useGlobalContext } from "@/lib/useGlobalContext";
import { BedDouble, CheckCircle2, UserCheck } from "lucide-react";

export default function BedStats() {
  const { beds } = useGlobalContext();

  const total = beds.length;
  const occupied = beds.filter((b: any) => b.isOccupied).length;
  const available = total - occupied;
  const pct = total ? Math.round((occupied / total) * 100) : 0;

  const cards = [
    { label: "Total beds", value: total, icon: BedDouble, color: "text-slate-700", bg: "bg-slate-100" },
    { label: "Available", value: available, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Occupied", value: occupied, icon: UserCheck, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="flex items-center gap-3 rounded-xl p-2 sm:p-3">
            <span className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:flex ${bg}`}>
              <Icon size={20} className={color} />
            </span>
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className={`text-xl font-bold sm:text-2xl ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>Occupancy</span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
