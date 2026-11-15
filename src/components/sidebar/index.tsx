"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Home,
  History,
  Users,
  BarChart3,
  FileSpreadsheet,
  ShieldCheck,
} from "lucide-react";
import { useGlobalContext } from "@/lib/useGlobalContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const sections = [
  {
    title: "Manage",
    links: [{ href: "/", label: "Home", icon: Home }],
  },
  {
    title: "Insights",
    links: [
      { href: "/statistics", label: "Statistics", icon: BarChart3 },
      { href: "/reports", label: "Reports", icon: FileSpreadsheet },
    ],
  },
  {
    title: "Records",
    links: [
      { href: "/history", label: "Booking History", icon: History },
      { href: "/user_history", label: "User History", icon: Users },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { admin } = useGlobalContext();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Close on Escape and lock background scroll while open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  // Render into <body>: the sticky header uses backdrop-filter, which turns it
  // into the containing block for fixed children and clipped the drawer to the
  // header's height. A portal also escapes the header's z-30 stacking context.
  // The menu is for admins only (Header also hides the toggle for other roles).
  if (!mounted || admin?.role !== "ADMIN") return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-72 max-w-[82vw] transform flex-col bg-slate-900 text-white transition-[transform,visibility] duration-300 ease-out ${
          isOpen ? "visible translate-x-0 shadow-2xl" : "invisible -translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <h2 className="text-lg font-bold tracking-tight">Menu</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          {sections.map((section) => (
            <div key={section.title} className="mb-4">
              <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {section.title}
              </p>
              <ul className="flex flex-col gap-1">
                {section.links.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href;
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors ${
                          active
                            ? "bg-indigo-600 text-white"
                            : "text-slate-200 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <Icon size={18} />
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {admin && (
          <div className="flex items-center gap-3 border-t border-slate-800 px-5 py-4">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold uppercase">
              {(admin.name || admin.email || "A").charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{admin.name || admin.email}</p>
              <p className="flex items-center gap-1 text-xs text-slate-400">
                <ShieldCheck size={12} /> Admin
              </p>
            </div>
          </div>
        )}
      </aside>
    </>,
    document.body
  );
};

export default Sidebar;
