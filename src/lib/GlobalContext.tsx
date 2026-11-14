"use client";

import axios from "axios";
import React, {
  createContext,
  useCallback,
  useMemo,
  useReducer,
  ReactNode,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import type { IAdmin, ICustomer } from "@/types";

// Same-origin Next.js API. Cookies (httpOnly auth) are sent automatically.
const api = axios.create({ baseURL: "/api", withCredentials: true });

function errorMessage(error: any, fallback: string): string {
  return error?.response?.data?.message || fallback;
}

interface State {
  beds: any[];
  admin: IAdmin | null;
  history: any | null;
  customer: ICustomer | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  bookings: any[];
}

type Action =
  | { type: "ADMIN_LOGIN"; payload: { admin: IAdmin } }
  | { type: "ADMIN_LOGOUT" }
  | {
      type: "INITIAL";
      payload: { isAuthenticated: boolean; admin: IAdmin | null };
    }
  | { type: "GET_BEDS"; payload: { beds: any[] } }
  | { type: "UPDATE_BED"; payload: { bed: any } }
  | { type: "GET_CUSTOMER_DETAILS"; payload: { customer: ICustomer | null } }
  | { type: "GET_BEDS_HISTORY"; payload: { history: any | null } }
  | { type: "USER_BOOKINGS"; payload: { bookings: any } };

const initialState: State = {
  admin: null,
  beds: [],
  history: null,
  customer: null,
  isAuthenticated: false,
  isInitialized: false,
  bookings: [],
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADMIN_LOGIN":
      return { ...state, admin: action.payload.admin, isAuthenticated: true };
    case "ADMIN_LOGOUT":
      return { ...state, admin: null, isAuthenticated: false };
    case "INITIAL":
      return {
        ...state,
        isInitialized: true,
        isAuthenticated: action.payload.isAuthenticated,
        admin: action.payload.admin,
      };
    case "GET_BEDS":
      return { ...state, beds: action.payload.beds };
    case "UPDATE_BED":
      return {
        ...state,
        beds: state.beds.map((b: any) =>
          b._id === action.payload.bed?._id ? { ...b, ...action.payload.bed } : b
        ),
      };
    case "GET_CUSTOMER_DETAILS":
      return { ...state, customer: action.payload.customer };
    case "GET_BEDS_HISTORY":
      return { ...state, history: action.payload.history };
    case "USER_BOOKINGS":
      return { ...state, bookings: action.payload.bookings };
    default:
      return state;
  }
};

interface GlobalContextType {
  admin: IAdmin | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  customer: ICustomer | null;
  getBedHistory: () => Promise<{ history: any | null; error?: string }>;
  history: any;
  getCustomerDetails: (
    number: string
  ) => Promise<{ customer: ICustomer | null; error?: string }>;
  checkOutBed: (bedId: string) => Promise<{
    bed: any;
    customer: any;
    blob: Blob;
    filename: string;
  }>;
  adminLogin: (body: {
    email: string;
    password: string;
  }) => Promise<{ admin: IAdmin | null }>;
  adminRegister: (body: {
    email: string;
    password: string;
    role: string;
    name: string;
  }) => Promise<{ admin: IAdmin | null; error?: string }>;
  adminLogout: () => Promise<void>;
  allocateBed: (body: {
    name: string;
    email: string;
    number: string;
    age: number;
    aadharFront: FileList;
    aadharBack: FileList;
    bed: string;
    photo: FileList;
    period: string;
    purpose: string;
    paymentType: string;
  }) => Promise<{ bed: any; customer: any }>;
  getBeds: () => Promise<{ beds: any[]; error?: string }>;
  beds: any;
  getUserBookings: (body: { number: string }) => Promise<{ bookings: any[] }>;
  bookings: any[];
}

export const GlobalContext = createContext<GlobalContextType | null>(null);

/** Render invoice HTML to a downloadable PDF Blob in the browser (no server Chromium needed). */
async function htmlToPdfBlob(html: string, filename: string): Promise<Blob> {
  const html2pdf = (await import("html2pdf.js")).default;
  const opt = {
    filename,
    margin: 8,
    image: { type: "jpeg", quality: 0.95 },
    html2canvas: { useCORS: true, scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
  };
  return html2pdf().set(opt).from(html).outputPdf("blob");
}

export function GlobalContextProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const router = useRouter();

  const onUnauthenticated = useCallback(() => {
    dispatch({ type: "ADMIN_LOGOUT" });
    router.push("/login");
  }, [router]);

  // ---------------------------------- AUTH ----------------------------------
  const initialize = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/details");
      dispatch({
        type: "INITIAL",
        payload: { isAuthenticated: !!data.admin, admin: data.admin ?? null },
      });
    } catch {
      dispatch({
        type: "INITIAL",
        payload: { isAuthenticated: false, admin: null },
      });
    }
  }, []);

  const adminLogin = useCallback(
    async (body: { email: string; password: string }) => {
      try {
        const { data } = await api.post("/admin/login", body);
        dispatch({ type: "ADMIN_LOGIN", payload: { admin: data.admin } });
        return { admin: data.admin };
      } catch (error: any) {
        throw new Error(errorMessage(error, "Login failed. Please try again."));
      }
    },
    []
  );

  const adminRegister = useCallback(
    async (body: {
      email: string;
      password: string;
      role: string;
      name: string;
    }) => {
      try {
        const { data } = await api.post("/admin/register", body);
        return { admin: data.admin };
      } catch (error: any) {
        return {
          admin: null,
          error: errorMessage(error, "Registration failed. Please try again."),
        };
      }
    },
    []
  );

  const adminLogout = useCallback(async () => {
    try {
      await api.post("/admin/logout");
    } finally {
      dispatch({ type: "ADMIN_LOGOUT" });
      router.push("/login");
    }
  }, [router]);

  // -------------------------------- BEDS / CUSTOMERS ------------------------
  const getBeds = useCallback(async () => {
    try {
      const { data } = await api.get("/beds/get_beds");
      dispatch({ type: "GET_BEDS", payload: { beds: data.beds } });
      return { beds: data.beds };
    } catch (error: any) {
      if (error?.response?.status === 401) onUnauthenticated();
      return { beds: [], error: errorMessage(error, "Failed to fetch beds.") };
    }
  }, [onUnauthenticated]);

  const getCustomerDetails = useCallback(
    async (number: string) => {
      try {
        const { data } = await api.get(`/customer/customer_details/${number}`);
        dispatch({
          type: "GET_CUSTOMER_DETAILS",
          payload: { customer: data.customer },
        });
        return { customer: data.customer };
      } catch (error: any) {
        if (error?.response?.status === 401) onUnauthenticated();
        return {
          customer: null,
          error: errorMessage(error, "Customer not found."),
        };
      }
    },
    [onUnauthenticated]
  );

  const allocateBed = useCallback(
    async (body: {
      name: string;
      email: string;
      number: string;
      age: number;
      aadharFront: FileList;
      aadharBack: FileList;
      bed: string;
      photo: FileList;
      period: string;
      purpose: string;
      paymentType: string;
    }) => {
      try {
        const formData = new FormData();
        formData.append("name", body.name);
        formData.append("email", body.email);
        formData.append("number", body.number);
        formData.append("age", body.age?.toString() ?? "");
        formData.append("aadharFront", body.aadharFront[0]);
        formData.append("aadharBack", body.aadharBack[0]);
        formData.append("bed", body.bed);
        formData.append("purpose", body.purpose);
        formData.append("period", body.period);
        formData.append("photo", body.photo[0]);
        formData.append("paymentType", body.paymentType);

        // Let the browser set the multipart boundary automatically.
        const { data } = await api.post("/customer/allocate_bed", formData);
        const { bed, customer } = data;
        // Mark the bed as occupied right away so the grid updates in place;
        // the caller refreshes the full list from the server afterwards.
        if (bed?._id) {
          dispatch({
            type: "UPDATE_BED",
            payload: {
              bed: {
                ...bed,
                isOccupied: true,
                customer: bed.customer && typeof bed.customer === "object" ? bed.customer : customer,
              },
            },
          });
        }
        return { bed, customer };
      } catch (error: any) {
        if (error?.response?.status === 401) onUnauthenticated();
        throw new Error(errorMessage(error, "Something went wrong"));
      }
    },
    [onUnauthenticated]
  );

  const checkOutBed = useCallback(
    async (bedId: string) => {
      try {
        const { data } = await api.post(`/beds/checkout/${bedId}`);
        const { invoice, bed, customer } = data;
        return {
          bed,
          customer,
          blob: await htmlToPdfBlob(invoice.html, invoice.filename),
          filename: invoice.filename,
        };
      } catch (error: any) {
        if (error?.response?.status === 401) onUnauthenticated();
        throw new Error(errorMessage(error, "Something went wrong"));
      }
    },
    [onUnauthenticated]
  );

  const getBedHistory = useCallback(async () => {
    try {
      const { data } = await api.get("/beds/get_beds_history");
      dispatch({ type: "GET_BEDS_HISTORY", payload: { history: data.history } });
      return { history: data.history };
    } catch (error: any) {
      if (error?.response?.status === 401) onUnauthenticated();
      throw new Error(errorMessage(error, "Failed to fetch history."));
    }
  }, [onUnauthenticated]);

  const getUserBookings = useCallback(
    async (body: { number: string }) => {
      try {
        const { data } = await api.get(`/customer/user_bookings/${body.number}`);
        dispatch({ type: "USER_BOOKINGS", payload: { bookings: data } });
        return { bookings: data };
      } catch (error: any) {
        if (error?.response?.status === 401) onUnauthenticated();
        throw new Error(errorMessage(error, "Something went wrong"));
      }
    },
    [onUnauthenticated]
  );

  useEffect(() => {
    initialize();
  }, [initialize]);

  const memoizedValue = useMemo(
    () => ({
      admin: state.admin,
      isAuthenticated: state.isAuthenticated,
      isInitialized: state.isInitialized,
      initialize,
      adminLogin,
      adminRegister,
      adminLogout,
      customer: state.customer,
      allocateBed,
      getCustomerDetails,
      beds: state.beds,
      getBeds,
      history: state.history,
      getBedHistory,
      checkOutBed,
      getUserBookings,
      bookings: state.bookings,
    }),
    [
      state.admin,
      state.isAuthenticated,
      state.isInitialized,
      initialize,
      adminLogin,
      adminRegister,
      adminLogout,
      state.beds,
      allocateBed,
      getBeds,
      getCustomerDetails,
      state.customer,
      state.history,
      getBedHistory,
      checkOutBed,
      getUserBookings,
      state.bookings,
    ]
  );

  return (
    <GlobalContext.Provider value={memoizedValue}>
      {children}
    </GlobalContext.Provider>
  );
}
