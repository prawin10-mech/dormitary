"use client";
import { useGlobalContext } from "@/lib/useGlobalContext";
import React, { useState } from "react";
import { IoMdMenu } from "react-icons/io";
import { MdOutlineLogout } from "react-icons/md";
import Sidebar from "../sidebar";

export default function Header() {
  const { adminLogout } = useGlobalContext();
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <header className="relative flex items-center justify-between bg-red-100 p-4 lg:p-6 h-32 lg:h-16">
      {/* Sidebar Button */}
      <button
        onClick={toggleSidebar}
        className="p-2 lg:p-4 text-gray-700 hover:text-gray-900 transition-colors"
        aria-label="Toggle Sidebar"
      >
        <IoMdMenu size={24} />
      </button>

      {/* Title */}
      <h1 className="text-2xl lg:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-800 flex-grow text-center">
        {process.env.NEXT_PUBLIC_TITLE}
      </h1>

      {/* Logout Button */}
      <button
        onClick={adminLogout}
        className="p-2 lg:p-4 text-gray-700 hover:text-gray-900 transition-colors"
        aria-label="Logout"
      >
        <MdOutlineLogout size={24} />
      </button>

      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
    </header>
  );
}
