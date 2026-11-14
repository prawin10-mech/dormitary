"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGlobalContext } from "@/lib/useGlobalContext";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";

const LoginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormInput = z.infer<typeof LoginSchema>;

export default function Login() {
  const { adminLogin, initialize } = useGlobalContext();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit: SubmitHandler<LoginFormInput> = async (values) => {
    try {
      await toast.promise(adminLogin(values), {
        loading: "Signing in…",
        success: "Welcome back!",
        error: (err) => err?.toString() || "Login failed",
      });
      await initialize();
      // Navigate to the dashboard (middleware only redirects on a fresh request).
      router.replace("/");
      router.refresh();
    } catch {
      /* toast already showed the error */
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-xl ring-1 ring-slate-200">
        <div className="mb-6 text-center">
          <h1 className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-2xl font-extrabold text-transparent">
            {process.env.NEXT_PUBLIC_TITLE || "Dormitary"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-rose-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                {...register("password")}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-11 text-base transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-rose-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}
