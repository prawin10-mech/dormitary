"use client";

import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGlobalContext } from "@/lib/useGlobalContext";
import toast, { Toaster } from "react-hot-toast";

const LoginSchema = z.object({
  email: z.string().min(1, "Email is Required").email("Invalid email format"),
  password: z
    .string()
    .min(1, "Password is Required")
    .min(6, "Password must be greater than 6 characters"),
});

type LoginFormInput = z.infer<typeof LoginSchema>;

export default function Login() {
  const { adminLogin, initialize } = useGlobalContext();

  const defaultValues = {
    email: "",
    password: "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues,
  });

  const onSubmit: SubmitHandler<LoginFormInput> = async (values) => {
    toast
      .promise(
        adminLogin(values),
        {
          loading: "Loading",
          success: () => `Logged In Successfully`,
          error: (err) => `This just happened: ${err.toString()}`,
        },
        {
          style: {
            minWidth: "250px",
          },
          success: {
            duration: 5000,
            icon: "🔥",
          },
        }
      )
      .then(() => {
        initialize();
      });
  };

  return (
    <div className="w-full h-screen flex justify-center items-center bg-gray-100">
      <div className="max-w-sm w-full bg-white border border-gray-300 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
          Login
        </h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              {...register("email")}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {errors.email && (
              <span className="text-red-600 text-sm mt-1">
                {errors.email.message}
              </span>
            )}
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register("password")}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {isSubmitting ? "Logging In.." : "Log In"}
          </button>
        </form>
      </div>
      <Toaster />
    </div>
  );
}
