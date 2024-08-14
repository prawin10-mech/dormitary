"use client";
import { usePathname, useRouter } from "next/navigation";
import { animatePageOut } from "@/lib/animations";

interface Props {
  href: string;
  label: string;
}

const TransitionLink = ({ href, label }: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = () => {
    if (pathname !== href) {
      animatePageOut(href, router);
    }
  };

  return (
    <button
      className="text-xl text-white-900 hover:text-gray-300"
      onClick={handleClick}
    >
      {label}
    </button>
  );
};

export default TransitionLink;
