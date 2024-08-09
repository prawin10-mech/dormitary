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

interface State {
  beds: any[];
  admin: IAdmin | null;
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
  | { type: "GET_BEDS"; payload: { beds: any[] } };

const initialState: State = {
  admin: null,
  beds: [],
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
    case "GET_BEDS":
      return {
        ...state,
        beds: action.payload.beds,
      };
    default:
      return state;
  }
};

interface GlobalContextType {
  admin: IAdmin | null;
  isAuthenticated: boolean;
  initialize: () => Promise<void>;
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
  }) => Promise<{ bed: any; customer: any; error?: string }>;
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

        dispatch({
          type: "INITIAL",
          payload: {
            isAuthenticated: !!data,
            admin: data || null,
          },
        });
      } else {
        dispatch({
          type: "INITIAL",
          payload: {
            isAuthenticated: false,
            admin: null,
          },
        });
      }
    } catch (error) {
      console.error(error);
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
      } catch (error) {
        return { admin: null, error: "Login failed. Please try again." };
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
      } catch (error) {
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
    } catch (error) {
      return { beds: [], error: "Failed to fetch beds. Please try again." };
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

        const { bed, customer } = data;

        dispatch({
          type: "ALLOCATE_BED",
          payload: { bed, customer },
        });

        return { bed, customer };
      } catch (error: any) {
        throw new Error(error.response.data.message || "Something went wrong");
        // return {
        //   bed: null,
        //   customer: null,
        //   error: "Failed to allocate bed. Please try again.",
        // };
      }
    },
    []
  );

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
      allocateBed,

      // beds
      beds: state.beds,
      getBeds,
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
    ]
  );

  return (
    <GlobalContext.Provider value={memoizedValue}>
      {children}
    </GlobalContext.Provider>
  );
}
