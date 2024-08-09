"use client";

import { useContext } from "react";
//
import { GlobalContext } from "./GlobalContext";

// ----------------------------------------------------------------------

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);

  if (!context) throw new Error("useGlobalContext context must be provided");

  return context;
};
