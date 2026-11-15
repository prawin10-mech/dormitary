import React from "react";

// The root layout already provides GlobalContext. A second provider here gave
// the login page its own copy of auth state, so after signing in the app's
// real state still had no admin and the menu only appeared after a refresh.
export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
