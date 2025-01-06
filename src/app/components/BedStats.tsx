"use client";

import React from "react";
import { useGlobalContext } from "@/lib/useGlobalContext";

export default function BedStats() {
  const { beds } = useGlobalContext();

  const totalBeds = beds.length;
  const occupiedBeds = beds.filter((bed: any) => bed.isOccupied).length;
  const availableBeds = totalBeds - occupiedBeds;

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 flex items-center justify-around mb-4">
      <div className="text-center">
        <p className="text-sm text-gray-500">Total Beds</p>
        <p className="text-xl font-bold">{totalBeds}</p>
      </div>

      <div className="border-r border-gray-300 h-6 mx-4" />

      <div className="text-center">
        <p className="text-sm text-gray-500">Available</p>
        <p className="text-xl font-bold text-green-600">{availableBeds}</p>
      </div>

      <div className="border-r border-gray-300 h-6 mx-4" />

      <div className="text-center">
        <p className="text-sm text-gray-500">Occupied</p>
        <p className="text-xl font-bold text-red-600">{occupiedBeds}</p>
      </div>
    </div>
  );
}
