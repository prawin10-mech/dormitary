import React from "react";

export default function Header() {
  return (
    <div className="h-16 max-w-100 bg-red-100">
      <h1 className="font-extrabold text-transparent text-center text-5xl bg-clip-text bg-gradient-to-r from-purple-400 to-pink-800">
        {process.env.NEXT_PUBLIC_TITLE}
      </h1>
    </div>
  );
}
