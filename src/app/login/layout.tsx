import { GlobalContextProvider } from "@/lib/GlobalContext";
import React from "react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <GlobalContextProvider>{children}</GlobalContextProvider>
    </div>
  );
}
