import React, { useRef, useEffect } from "react";
import { X } from "lucide-react";
import TransitionLink from "../TransitionLink";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm">
      <div
        ref={sidebarRef}
        className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white shadow-xl ring-1 ring-slate-800"
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <h2 className="text-lg font-bold tracking-tight">Menu</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="p-3">
          <ul className="flex flex-col gap-1">
            <li className="rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-800">
              <TransitionLink href="/" label="Home" />
            </li>
            <li className="rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-800">
              <TransitionLink href="/history" label="History" />
            </li>
            <li className="rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-800">
              <TransitionLink href="/user_history" label="User History" />
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
