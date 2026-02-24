"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RegisterData, registerSchema } from "../schema";
import { handleRegister } from "@/lib/actions/auth-actions";

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
  });

  const [pending, startTransition] = useTransition();

  const submit = async (values: RegisterData) => {
    startTransition(async () => {
      const res = await handleRegister(values);
      if (res.success) {
        router.push("/login");
      } else {
        alert(res.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          className="h-10 w-full rounded-lg border border-white/20 bg-black/40 px-3 text-sm text-white outline-none placeholder-white/50 transition focus:border-red-500/60 focus:bg-black/60"
          {...register("name")}
          placeholder="Your name"
        />
        {errors.name?.message && (
          <p className="text-[11px] text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="h-10 w-full rounded-lg border border-white/20 bg-black/40 px-3 text-sm text-white outline-none placeholder-white/50 transition focus:border-red-500/60 focus:bg-black/60"
          {...register("email")}
          placeholder="you@example.com"
        />
        {errors.email?.message && (
          <p className="text-[11px] text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-medium" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            className="h-10 w-full rounded-lg border border-white/20 bg-black/40 px-3 pr-14 text-sm text-white outline-none placeholder-white/50 transition focus:border-red-500/60 focus:bg-black/60"
            {...register("password")}
            placeholder="••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-white/70 hover:text-white"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {errors.password?.message && (
          <p className="text-[11px] text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-medium" htmlFor="confirmPassword">
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            className="h-10 w-full rounded-lg border border-white/20 bg-black/40 px-3 pr-14 text-sm text-white outline-none placeholder-white/50 transition focus:border-red-500/60 focus:bg-black/60"
            {...register("confirmPassword")}
            placeholder="••••••"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-white/70 hover:text-white"
          >
            {showConfirmPassword ? "Hide" : "Show"}
          </button>
        </div>
        {errors.confirmPassword?.message && (
          <p className="text-[11px] text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || pending}
        className="mt-1 h-10 w-full rounded-lg bg-red-600 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
      >
        {isSubmitting || pending ? "Creating account..." : "Create account"}
      </button>

      <div className="mt-1 text-center text-xs text-white/70">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-red-400 hover:text-red-300 hover:underline">
          Log in
        </Link>
      </div>
    </form>
  );
}
