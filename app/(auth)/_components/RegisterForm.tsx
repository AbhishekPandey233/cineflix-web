"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RegisterData, registerSchema } from "../schema";
import { handleRegister } from "@/lib/actions/auth-actions";

export default function RegisterForm() {
  const router = useRouter();

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
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className="space-y-2">
        <label className="text-xs font-medium" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          className="h-10 w-full rounded-md border border-white/30 bg-white/10 px-3 text-sm text-white outline-none placeholder-white/60 focus:border-white/50 focus:bg-white/20"
          {...register("name")}
          placeholder="Your name"
        />
        {errors.name?.message && (
          <p className="text-[11px] text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="h-10 w-full rounded-md border border-white/30 bg-white/10 px-3 text-sm text-white outline-none placeholder-white/60 focus:border-white/50 focus:bg-white/20"
          {...register("email")}
          placeholder="you@example.com"
        />
        {errors.email?.message && (
          <p className="text-[11px] text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="h-10 w-full rounded-md border border-white/30 bg-white/10 px-3 text-sm text-white outline-none placeholder-white/60 focus:border-white/50 focus:bg-white/20"
          {...register("password")}
          placeholder="••••••"
        />
        {errors.password?.message && (
          <p className="text-[11px] text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium" htmlFor="confirmPassword">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          className="h-10 w-full rounded-md border border-white/30 bg-white/10 px-3 text-sm text-white outline-none placeholder-white/60 focus:border-white/50 focus:bg-white/20"
          {...register("confirmPassword")}
          placeholder="••••••"
        />
        {errors.confirmPassword?.message && (
          <p className="text-[11px] text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || pending}
        className="mt-2 h-10 w-full rounded-md bg-foreground text-background text-sm font-semibold hover:opacity-90 disabled:opacity-60"
      >
        {isSubmitting || pending ? "Creating account..." : "Create account"}
      </button>

      <div className="mt-2 text-center text-xs">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold hover:underline">
          Log in
        </Link>
      </div>
    </form>
  );
}
