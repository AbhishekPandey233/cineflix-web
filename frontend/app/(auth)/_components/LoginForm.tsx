"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { ForgotPasswordData, LoginData, ResetPasswordData, forgotPasswordSchema, loginSchema, resetPasswordSchema } from "../schema";
import { handleForgotPassword, handleLogin, handleResetPassword } from "@/lib/actions/auth-actions";

export default function LoginForm() {
  const [mode, setMode] = useState<"login" | "forgot" | "reset">("login");
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [prefillToken, setPrefillToken] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });

  const {
    register: registerForgot,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors, isSubmitting: isForgotSubmitting },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onSubmit",
  });

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors, isSubmitting: isResetSubmitting },
    setError: setResetError,
    setValue: setResetValue,
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onSubmit",
    defaultValues: { token: "" },
  });

  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (prefillToken) {
      setResetValue("token", prefillToken);
    }
  }, [prefillToken, setResetValue]);

  const submit = async (values: LoginData) => {
    startTransition(async () => {
      const res = await handleLogin(values);

      if (res.success) {
        const role = res.data?.role;

        if (role === "admin") {
          window.location.assign("/admin/users");
        } else {
          window.location.assign("/home");
        }
      } else {
        alert(res.message);
      }
    });
  };

  const submitForgot = async (values: ForgotPasswordData) => {
    startTransition(async () => {
      const res = await handleForgotPassword(values);

      if (res.success) {
        setStatus({ type: "success", text: res.message });
        const token = res.data?.resetToken;
        if (token) {
          setPrefillToken(token);
          setMode("reset");
        }
      } else {
        setStatus({ type: "error", text: res.message });
      }
    });
  };

  const submitReset = async (values: ResetPasswordData) => {
    startTransition(async () => {
      const res = await handleResetPassword(values);

      if (res.success) {
        setStatus({ type: "success", text: res.message });
        setMode("login");
      } else {
        if (res.message?.toLowerCase().includes("old password")) {
          setResetError("password", { type: "server", message: "Old password entered" });
        }
        setStatus({ type: "error", text: res.message });
      }
    });
  };

  return (
    <div className="space-y-5">
      {status && (
        <div
          className={`rounded-lg border px-3 py-2 text-xs ${status.type === "success" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-red-500/30 bg-red-500/10 text-red-200"}`}
        >
          {status.text}
        </div>
      )}

      {mode === "login" && (
        <form onSubmit={handleSubmit(submit)} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="h-11 w-full rounded-lg border border-white/20 bg-black/40 px-3 text-sm text-white outline-none placeholder-white/50 transition focus:border-red-500/60 focus:bg-black/60"
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
            <div className="relative">
              <input
                id="password"
                type={showLoginPassword ? "text" : "password"}
                autoComplete="current-password"
                className="h-11 w-full rounded-lg border border-white/20 bg-black/40 px-3 pr-14 text-sm text-white outline-none placeholder-white/50 transition focus:border-red-500/60 focus:bg-black/60"
                {...register("password")}
                placeholder="••••••"
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-white/70 hover:text-white"
              >
                {showLoginPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password?.message && (
              <p className="text-[11px] text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setStatus(null);
                setMode("forgot");
              }}
              className="text-white/70 hover:text-white hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || pending}
            className="mt-2 h-11 w-full rounded-lg bg-red-600 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {isSubmitting || pending ? "Logging in..." : "Log in"}
          </button>

          <div className="mt-2 text-center text-xs text-white/70">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-red-400 hover:text-red-300 hover:underline">
              Sign up
            </Link>
          </div>
        </form>
      )}

      {mode === "forgot" && (
        <form onSubmit={handleForgotSubmit(submitForgot)} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-medium" htmlFor="forgot-email">
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              className="h-11 w-full rounded-lg border border-white/20 bg-black/40 px-3 text-sm text-white outline-none placeholder-white/50 transition focus:border-red-500/60 focus:bg-black/60"
              {...registerForgot("email")}
              placeholder="you@example.com"
            />
            {forgotErrors.email?.message && (
              <p className="text-[11px] text-red-600">{forgotErrors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isForgotSubmitting || pending}
            className="mt-2 h-11 w-full rounded-lg bg-red-600 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {isForgotSubmitting || pending ? "Sending..." : "Send reset token"}
          </button>

          <div className="mt-2 text-center text-xs text-white/70">
            <button
              type="button"
              onClick={() => {
                setStatus(null);
                setMode("login");
              }}
              className="font-semibold text-red-400 hover:text-red-300 hover:underline"
            >
              Back to login
            </button>
          </div>
        </form>
      )}

      {mode === "reset" && (
        <form onSubmit={handleResetSubmit(submitReset)} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-medium" htmlFor="reset-token">
              Reset Token
            </label>
            <input
              id="reset-token"
              type="text"
              className="h-11 w-full rounded-lg border border-white/20 bg-black/40 px-3 text-sm text-white outline-none placeholder-white/50 transition focus:border-red-500/60 focus:bg-black/60"
              {...registerReset("token")}
              placeholder="Paste your reset token"
            />
            {resetErrors.token?.message && (
              <p className="text-[11px] text-red-600">{resetErrors.token.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium" htmlFor="reset-password">
              New Password
            </label>
            <div className="relative">
              <input
                id="reset-password"
                type={showResetPassword ? "text" : "password"}
                autoComplete="new-password"
                className="h-11 w-full rounded-lg border border-white/20 bg-black/40 px-3 pr-14 text-sm text-white outline-none placeholder-white/50 transition focus:border-red-500/60 focus:bg-black/60"
                {...registerReset("password")}
                placeholder="••••••"
              />
              <button
                type="button"
                onClick={() => setShowResetPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-white/70 hover:text-white"
              >
                {showResetPassword ? "Hide" : "Show"}
              </button>
            </div>
            {resetErrors.password?.message && (
              <p className="text-[11px] text-red-600">{resetErrors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium" htmlFor="reset-confirm">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="reset-confirm"
                type={showResetConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                className="h-11 w-full rounded-lg border border-white/20 bg-black/40 px-3 pr-14 text-sm text-white outline-none placeholder-white/50 transition focus:border-red-500/60 focus:bg-black/60"
                {...registerReset("confirmPassword")}
                placeholder="••••••"
              />
              <button
                type="button"
                onClick={() => setShowResetConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-white/70 hover:text-white"
              >
                {showResetConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            {resetErrors.confirmPassword?.message && (
              <p className="text-[11px] text-red-600">{resetErrors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isResetSubmitting || pending}
            className="mt-2 h-11 w-full rounded-lg bg-red-600 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {isResetSubmitting || pending ? "Resetting..." : "Reset password"}
          </button>

          <div className="mt-2 text-center text-xs text-white/70">
            <button
              type="button"
              onClick={() => {
                setStatus(null);
                setMode("login");
              }}
              className="font-semibold text-red-400 hover:text-red-300 hover:underline"
            >
              Back to login
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
