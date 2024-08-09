"use client";
import { useGlobalContext } from "@/lib/useGlobalContext";
import React from "react";
import { MdOutlineLogout } from "react-icons/md";

export default function Header() {
  const { adminLogout } = useGlobalContext();
  return (
    <div className="h-32 lg:h-16 max-w-100 bg-red-100">
      <h1 className="font-extrabold text-transparent text-center text-5xl bg-clip-text bg-gradient-to-r from-purple-400 to-pink-800">
        {process.env.NEXT_PUBLIC_TITLE}
      </h1>
      <button onClick={adminLogout} className="absolute top-5 right-5">
        <MdOutlineLogout />
      </button>
    </div>
  );
}
