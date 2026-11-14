"use client";
import Link from "next/link";

interface Props {
  href: string;
  label: string;
}

// Instant client-side navigation (the old gsap screen-wipe was removed for speed).
const TransitionLink = ({ href, label }: Props) => {
  return (
    <Link
      href={href}
      className="block text-base text-white hover:text-gray-300 transition-colors"
    >
      {label}
    </Link>
  );
};

export default TransitionLink;
