import React, { useRef, useEffect } from "react";
import Link from "next/link";
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
    <div
      ref={sidebarRef}
      className="fixed top-0 left-0 w-64 h-full bg-gray-800 text-white shadow-lg"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold">Menu</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white"
          aria-label="Close Sidebar"
        >
          &times;
        </button>
      </div>
      <nav className="p-4">
        <ul>
          <li className="mb-2">
            <TransitionLink href="/" label="Home" />
          </li>
          <li>
            <TransitionLink href="/history" label="History" />
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
