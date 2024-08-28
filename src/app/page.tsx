"use client";

import NewUserForm from "./components/NewUserForm";
import Bed from "./components/Bed";
import Header from "@/components/Header";
import { useGlobalContext } from "@/lib/useGlobalContext";
import { useEffect } from "react";

export default function Home() {
  const { beds, getBeds } = useGlobalContext();

  useEffect(() => {
    getBeds();
  }, []);

  return (
    <div className="flex flex-col  scrollbar-width: none;">
      <div className="w-full bg-white shadow-lg rounded-lg mb-4 md:mb-0">
        <Header />
      </div>
      <div className="flex flex-col lg:flex-row p-4 bg-gray-100 min-h-screen">
        <div className="w-full lg:w-1/3 p-4 bg-white shadow-lg rounded-lg mb-4 md:mb-0">
          <h1 className="text-2xl font-bold mb-4">Welcome</h1>
          <NewUserForm />
        </div>
        <div className="flex flex-col lg:w-2/3 w-full p-1 sm:p-2 md:p-3 bg-red-200 shadow-lg rounded-lg overflow-auto h-full">
          <h2 className="text-xl font-bold mb-4">Available Beds</h2>
          <div className="flex-grow min-h-0">
            {/* <div className="grid grid-cols-3  sm:grid-cols-6  mb-3">
              {beds.slice(0, 12).map((bed: any) => (
                <Bed
                  key={bed._id}
                  name={bed.bed}
                  occupied={bed.isOccupied}
                  endsIn={bed.occupiedDate}
                  type={bed.type}
                  bed={bed}
                />
              ))}
            </div> */}
            <div className="border-b-2 border-dotted border-gray-500 my-4" />
            <div className="grid grid-cols-3  sm:grid-cols-5 ">
              {beds
                .filter((b: any) => b.bed.startsWith("A"))
                .map((bed: any) => (
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
            <div className="border-b-2 border-dotted border-gray-500 my-4" />
            <div className="grid grid-cols-3  sm:grid-cols-5 ">
              {beds
                .filter((b: any) => b.bed.startsWith("B"))
                .map((bed: any) => (
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
            <div className="border-b-2 border-dotted border-gray-500 my-4" />
            <div className="grid grid-cols-3  sm:grid-cols-5 ">
              {beds
                .filter((b: any) => b.bed.startsWith("C"))
                .map((bed: any) => (
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
          </div>
        </div>
      </div>
    </div>
  );
}
