"use client";

import { useGlobalContext } from "@/lib/useGlobalContext";
import React, { useState } from "react";
import { Menu, LogOut } from "lucide-react";
import Sidebar from "../sidebar";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const { adminLogout, admin } = useGlobalContext();
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <header className="sticky top-0 z-30 flex w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur sm:px-6">
      {/* Sidebar Button (reserve space when hidden to keep title centered) */}
      {admin && admin.role === "ADMIN" ? (
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
      ) : (
        <span className="w-10" />
      )}

      {/* Title */}
      <button
        type="button"
        className="cursor-pointer"
        onClick={() => router.push("/")}
        aria-label="Go home"
      >
        <h1 className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-xl font-extrabold text-transparent sm:text-2xl">
          {process.env.NEXT_PUBLIC_TITLE || "Dormitary"}
        </h1>
      </button>

      {/* Logout Button */}
      <button
        onClick={adminLogout}
        className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-600"
        aria-label="Logout"
      >
        <LogOut size={24} />
      </button>

      {admin && admin.role === "ADMIN" && (
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      )}
    </header>
  );
}
