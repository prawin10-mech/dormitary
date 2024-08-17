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
import Cookies from "js-cookie";
import { IAdmin } from "../../server/models/admin.model";
import localStorageAvailable from "./useLocalStorageAvailable";
import { isValidToken, setSession } from "./utils";
import { useRouter } from "next/navigation";
import { ICustomer } from "../../server/models/customer.model";

interface State {
  beds: any[];
  admin: IAdmin | null;
  history: any | null;
  customer: ICustomer | null;
  isAuthenticated: boolean;
}

type Action =
  | { type: "ADMIN_LOGIN"; payload: { admin: IAdmin; token: string } }
  | { type: "ADMIN_LOGOUT" }
  | {
      type: "INITIAL";
      payload: { isAuthenticated: boolean; admin: IAdmin | null };
    }
  | { type: "ALLOCATE_BED"; payload: { bed: any; customer: any } }
  | { type: "CHECKOUT_BED"; payload: { bed: any; customer: any } }
  | { type: "GET_BEDS"; payload: { beds: any[] } }
  | { type: "GET_CUSTOMER_DETAILS"; payload: { customer: ICustomer | null } }
  | { type: "GET_BEDS_HISTORY"; payload: { history: any | null } };

const initialState: State = {
  admin: null,
  beds: [],
  history: null,
  customer: null,
  isAuthenticated: false,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADMIN_LOGIN":
      return {
        ...state,
        admin: action.payload.admin,
        isAuthenticated: true,
      };
    case "ADMIN_LOGOUT":
      return {
        ...state,
        admin: null,
        isAuthenticated: false,
      };
    case "INITIAL":
      return {
        ...state,
        isAuthenticated: action.payload.isAuthenticated,
        admin: action.payload.admin,
      };
    case "ALLOCATE_BED":
      return {
        ...state,
        beds: [...state.beds, action.payload.bed],
      };

    case "CHECKOUT_BED":
      return {
        ...state,
        beds: [...state.beds, action.payload.bed],
      };
    case "GET_BEDS":
      return {
        ...state,
        beds: action.payload.beds,
      };
    case "GET_CUSTOMER_DETAILS":
      return {
        ...state,
        customer: action.payload.customer,
      };
    case "GET_BEDS_HISTORY":
      return {
        ...state,
        history: action.payload.history,
      };
    default:
      return state;
  }
};

interface GlobalContextType {
  admin: IAdmin | null;
  isAuthenticated: boolean;
  initialize: () => Promise<void>;
  customer: ICustomer | null;
  getBedHistory: () => Promise<{
    history: any | null;
    error?: string;
  }>;
  history: any;
  getCustomerDetails: (number: string) => Promise<{
    customer:
      | (ICustomer & { _id: string })
      | null
      | ((ICustomer & { _id: string }) & { bed: any });
    error?: string;
  }>;
  checkOutBed: (bedId: string) => Promise<{
    customer:
      | (ICustomer & { _id: string })
      | null
      | ((ICustomer & { _id: string }) & { bed: any });
    error?: string;
    blob: Blob | MediaSource;
    filename: string;
  }>;
  adminLogin: (body: {
    email: string;
    password: string;
  }) => Promise<{ admin: IAdmin | null; token?: string; error?: string }>;
  adminRegister: (body: {
    email: string;
    password: string;
    role: string;
    name: string;
  }) => Promise<{ admin: IAdmin | null; error?: string }>;
  adminLogout: () => void;
  allocateBed: (body: {
    name: string;
    email: string;
    number: string;
    age: number;
    aadhar: FileList;
    bed: string;
    photo: FileList;
  }) => Promise<{
    bed: any;
    customer: any;
    error?: string;
    blob: Blob | MediaSource;
    filename: string;
  }>;
  getBeds: () => Promise<{ beds: any[]; error?: string }>;
  beds: any;
}

export const GlobalContext = createContext<GlobalContextType | null>(null);

interface GlobalContextProviderProps {
  children: ReactNode;
}

export function GlobalContextProvider({
  children,
}: GlobalContextProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const router = useRouter();

  const storageAvailable = localStorageAvailable();

  // ----------------------AUTH-------------------------------------------------------
  const initialize = useCallback(async () => {
    try {
      let accessToken = storageAvailable ? Cookies.get("accessToken") : "";
      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/admin/details`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const { admin } = data;

        dispatch({
          type: "INITIAL",
          payload: {
            isAuthenticated: !!admin,
            admin: admin,
          },
        });
      } else {
        console.log("Else");
        dispatch({
          type: "INITIAL",
          payload: {
            isAuthenticated: false,
            admin: null,
          },
        });
      }
    } catch (error: any) {
      console.error(error);
      if (error.response.status === 401) {
        Cookies.remove("accessToken");
        router.push("/login");
      }
      dispatch({
        type: "INITIAL",
        payload: {
          isAuthenticated: false,
          admin: null,
        },
      });
    }
  }, []);

  const adminLogin = useCallback(
    async (body: { email: string; password: string }) => {
      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_URL}/admin/login`,
          body
        );

        const { admin, token } = data;
        Cookies.set("accessToken", token);
        setTimeout(() => {
          router.push("/");
        }, 1000);

        dispatch({
          type: "ADMIN_LOGIN",
          payload: { admin, token },
        });

        return { admin, token };
      } catch (error: any) {
        if (error.response.status === 401) {
          Cookies.remove("accessToken");
          router.push("/login");
        }
        throw new Error(
          error.response.data.message || "Login failed. Please try again."
        );
      }
    },
    [router]
  );

  const adminRegister = useCallback(
    async (body: {
      email: string;
      password: string;
      role: string;
      name: string;
    }) => {
      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_URL}/admin/register`,
          body
        );

        const { admin } = data;

        return { admin };
      } catch (error: any) {
        if (error.response.status === 401) {
          Cookies.remove("accessToken");
          router.push("/login");
        }
        return { admin: null, error: "Registration failed. Please try again." };
      }
    },
    []
  );

  const adminLogout = useCallback(() => {
    Cookies.remove("accessToken");
    router.push("/login");
    dispatch({ type: "ADMIN_LOGOUT" });
  }, [router]);

  // ---------------------CUSTOMER-------------------------------------------------------

  const getBeds = useCallback(async () => {
    try {
      let accessToken = storageAvailable ? Cookies.get("accessToken") : "";
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/beds/get_beds`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const { beds } = data;

      dispatch({
        type: "GET_BEDS",
        payload: { beds },
      });

      return { beds };
    } catch (error: any) {
      if (error.response.status === 401) {
        Cookies.remove("accessToken");
        router.push("/login");
      }
      return { beds: [], error: "Failed to fetch beds. Please try again." };
    }
  }, []);

  const getCustomerDetails = useCallback(async (number: string) => {
    try {
      let accessToken = storageAvailable ? Cookies.get("accessToken") : "";
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/customer/customer_details/${number}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const { customer } = data;

      dispatch({
        type: "GET_CUSTOMER_DETAILS",
        payload: { customer },
      });

      return { customer };
    } catch (error: any) {
      if (error.response.status === 401) {
        Cookies.remove("accessToken");
        router.push("/login");
      }
      return {
        customer: null,
        error: "Failed to fetch beds. Please try again.",
      };
    }
  }, []);

  const allocateBed = useCallback(
    async (body: {
      name: string;
      email: string;
      number: string;
      age: number;
      aadhar: FileList;
      bed: string;
      photo: FileList;
    }) => {
      try {
        const formData = new FormData();
        formData.append("name", body.name);
        formData.append("email", body.email);
        formData.append("number", body.number);
        formData.append("age", body.age.toString());
        formData.append("aadhar", body.aadhar[0]);
        formData.append("bed", body.bed);
        formData.append("photo", body.photo[0]);

        let accessToken = storageAvailable ? Cookies.get("accessToken") : "";

        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_URL}/customer/allocate_bed`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "multipart/form-data", // Important for file uploads
            },
          }
        );

        const { invoice, bed, customer } = data;

        dispatch({
          type: "ALLOCATE_BED",
          payload: { bed, customer },
        });

        const byteCharacters = atob(invoice.file);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);

        // Create Blob
        const blob = new Blob([byteArray], { type: "application/pdf" });

        return { bed, customer, blob, filename: invoice.filename };
      } catch (error: any) {
        if (error.response.status === 401) {
          Cookies.remove("accessToken");
          router.push("/login");
        }
        throw new Error(error.response.data.message || "Something went wrong");
      }
    },
    [storageAvailable]
  );

  const checkOutBed = useCallback(
    async (bedId: string) => {
      try {
        let accessToken = storageAvailable ? Cookies.get("accessToken") : "";

        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/beds/checkout/${bedId}`,

          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const { invoice, bed, customer } = data;

        dispatch({
          type: "CHECKOUT_BED",
          payload: { bed, customer },
        });

        const byteCharacters = atob(invoice.file);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);

        // Create Blob
        const blob = new Blob([byteArray], { type: "application/pdf" });

        return { bed, customer, blob, filename: invoice.filename };
      } catch (error: any) {
        if (error.response.status === 401) {
          Cookies.remove("accessToken");
          router.push("/login");
        }
        throw new Error(error.response.data.message || "Something went wrong");
      }
    },
    [storageAvailable]
  );

  const getBedHistory = useCallback(async () => {
    try {
      let accessToken = storageAvailable ? Cookies.get("accessToken") : "";
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/beds/get_beds_history`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const { history } = data;

      dispatch({
        type: "GET_BEDS_HISTORY",
        payload: { history },
      });

      return { history };
    } catch (error: any) {
      throw new Error(
        error.response.data.message ||
          "Failed to fetch history. Please try again."
      );
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const memoizedValue = useMemo(
    () => ({
      admin: state.admin,
      isAuthenticated: state.isAuthenticated,
      initialize,
      adminLogin,
      adminRegister,
      adminLogout,

      // customers
      customer: state.customer,
      allocateBed,
      getCustomerDetails,

      // beds
      beds: state.beds,
      getBeds,
      history: state.history,
      getBedHistory,
      checkOutBed,
    }),
    [
      state.admin,
      state.isAuthenticated,
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
    ]
  );

  return (
    <GlobalContext.Provider value={memoizedValue}>
      {children}
    </GlobalContext.Provider>
  );
}
