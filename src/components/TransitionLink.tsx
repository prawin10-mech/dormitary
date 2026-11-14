"use client";
import Link from "next/link";

interface Props {
  href: string;
  label: string;
  onClick?: () => void;
  className?: string;
}

// Instant client-side navigation (the old gsap screen-wipe was removed for speed).
const TransitionLink = ({ href, label, onClick, className }: Props) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={
        className ??
        "block rounded-lg px-3 py-2 text-base font-medium text-white/90 transition-colors hover:bg-slate-800 hover:text-white"
      }
    >
      {label}
    </Link>
  );
};

export default TransitionLink;
