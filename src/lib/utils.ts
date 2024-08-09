import axios from "axios";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DecodedToken {
  exp: number;
  [key: string]: any; // Add other fields if necessary
}

export function jwtDecode(token: string): DecodedToken {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join("")
  );

  return JSON.parse(jsonPayload);
}

// ----------------------------------------------------------------------

export const isValidToken = (accessToken?: string): boolean => {
  if (!accessToken) {
    return false;
  }

  const decoded = jwtDecode(accessToken);

  const currentTime = Date.now() / 1000;

  return decoded.exp > currentTime;
};

// ----------------------------------------------------------------------

export const tokenExpired = (exp: number) => {
  // Initialize expiredTimer to null
  let expiredTimer: NodeJS.Timeout | null = null;

  const currentTime = Date.now();

  const timeLeft = exp * 1000 - currentTime;

  // Clear the timeout if it was previously set
  if (expiredTimer !== null) {
    clearTimeout(expiredTimer);
  }

  expiredTimer = setTimeout(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("limitAccessToken");
    window.location.href = PATH_AUTH.login;
  }, timeLeft);
};
// ----------------------------------------------------------------------

export const setSession = (accessToken?: string) => {
  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);

    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

    // This function below will handle when token is expired
    const { exp } = jwtDecode(accessToken);
    tokenExpired(exp);
  } else {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("limitAccessToken");
    delete axios.defaults.headers.common.Authorization;
  }
};

// Make sure PATH_AUTH is defined
const PATH_AUTH = {
  login: "/login", // Replace with your actual login path
};
