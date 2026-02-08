"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosInstance from "@/lib/api/axios";
import { handleForgotPassword, handleResetPassword } from "@/lib/actions/auth-actions";
import { ForgotPasswordData, ResetPasswordData, forgotPasswordSchema, resetPasswordSchema } from "@/app/(auth)/schema";

type UserProfile = {
  email?: string;
  name?: string;
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const {
    register: registerForgot,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors, isSubmitting: isForgotSubmitting },
    setValue: setForgotValue,
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onSubmit",
  });

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors, isSubmitting: isResetSubmitting },
    setValue: setResetValue,
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onSubmit",
    defaultValues: { token: "" },
  });

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/api/user/profile");
        const profile = res.data?.data ?? null;
        if (mounted) {
          if (profile?.email) {
            setForgotValue("email", profile.email);
          }
        }
      } catch {
        if (mounted) setStatus({ type: "error", text: "Could not load profile" });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      mounted = false;
    };
  }, [setForgotValue]);

  const submitForgot = async (values: ForgotPasswordData) => {
    setStatus(null);
    startTransition(async () => {
      const res = await handleForgotPassword(values);

      if (res.success) {
        setStatus({ type: "success", text: res.message });
        const token = res.data?.resetToken;
        if (token) {
          setResetValue("token", token);
        }
      } else {
        setStatus({ type: "error", text: res.message });
      }
    });
  };

  const submitReset = async (values: ResetPasswordData) => {
    setStatus(null);
    startTransition(async () => {
      const res = await handleResetPassword(values);

      if (res.success) {
        setStatus({ type: "success", text: res.message });
      } else {
        setStatus({ type: "error", text: res.message });
      }
    });
  };

  return (
    <div className="min-h-screen bg-black text-white pt-14">
      <div className="mx-auto max-w-5xl p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="mt-2 text-white/70">Manage your password and account security.</p>
          </div>
          <Link href="/user/profile" className="text-sm text-white/80 hover:underline">
            Back to profile
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-white/15 bg-white/10 p-6 lg:col-span-1">
            <h2 className="text-lg font-semibold">Password</h2>
            <p className="mt-2 text-sm text-white/70">For security reasons, passwords are never displayed in plain text.</p>

            <div className="mt-4 rounded-lg border border-white/10 bg-black/30 px-4 py-3">
              <div className="text-xs uppercase tracking-widest text-white/50">Current Password</div>
              <div className="mt-2 text-lg font-semibold">••••••••••</div>
              <div className="mt-1 text-xs text-white/50">Last updated: not available</div>
            </div>

            <div className="mt-4 text-xs text-white/60">
              Reset tokens expire after 30 minutes. If you did not request a reset, ignore the token.
            </div>
          </div>

          <div className="rounded-xl border border-white/15 bg-white/10 p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold">Reset your password</h2>
            <p className="mt-2 text-sm text-white/70">
              Request a reset token using your email, then set a new password.
            </p>

            {status && (
              <div className={`mt-4 rounded-md border px-3 py-2 text-xs ${status.type === "success" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-red-500/30 bg-red-500/10 text-red-200"}`}>
                {status.text}
              </div>
            )}

            {loading ? (
              <div className="mt-4 text-sm text-white/60">Loading profile…</div>
            ) : (
              <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <form onSubmit={handleForgotSubmit(submitForgot)} className="space-y-4">
                  <div>
                    <label className="text-xs font-medium" htmlFor="forgot-email">
                      Email
                    </label>
                    <input
                      id="forgot-email"
                      type="email"
                      autoComplete="email"
                      className="mt-2 h-10 w-full rounded-md border border-white/30 bg-white/10 px-3 text-sm text-white outline-none placeholder-white/60 focus:border-white/50 focus:bg-white/20"
                      placeholder="you@example.com"
                      {...registerForgot("email")}
                    />
                    {forgotErrors.email?.message && (
                      <p className="mt-1 text-[11px] text-red-600">{forgotErrors.email.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isForgotSubmitting || pending}
                    className="h-10 w-full rounded-md bg-foreground text-background text-sm font-semibold hover:opacity-90 disabled:opacity-60"
                  >
                    {isForgotSubmitting || pending ? "Sending..." : "Send reset token"}
                  </button>
                </form>

                <form onSubmit={handleResetSubmit(submitReset)} className="space-y-4">
                  <div>
                    <label className="text-xs font-medium" htmlFor="reset-token">
                      Reset token
                    </label>
                    <input
                      id="reset-token"
                      type="text"
                      className="mt-2 h-10 w-full rounded-md border border-white/30 bg-white/10 px-3 text-sm text-white outline-none placeholder-white/60 focus:border-white/50 focus:bg-white/20"
                      placeholder="Paste your reset token"
                      {...registerReset("token")}
                    />
                    {resetErrors.token?.message && (
                      <p className="mt-1 text-[11px] text-red-600">{resetErrors.token.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium" htmlFor="new-password">
                      New password
                    </label>
                    <input
                      id="new-password"
                      type="password"
                      autoComplete="new-password"
                      className="mt-2 h-10 w-full rounded-md border border-white/30 bg-white/10 px-3 text-sm text-white outline-none placeholder-white/60 focus:border-white/50 focus:bg-white/20"
                      placeholder="••••••"
                      {...registerReset("password")}
                    />
                    {resetErrors.password?.message && (
                      <p className="mt-1 text-[11px] text-red-600">{resetErrors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium" htmlFor="confirm-password">
                      Confirm password
                    </label>
                    <input
                      id="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      className="mt-2 h-10 w-full rounded-md border border-white/30 bg-white/10 px-3 text-sm text-white outline-none placeholder-white/60 focus:border-white/50 focus:bg-white/20"
                      placeholder="••••••"
                      {...registerReset("confirmPassword")}
                    />
                    {resetErrors.confirmPassword?.message && (
                      <p className="mt-1 text-[11px] text-red-600">{resetErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isResetSubmitting || pending}
                    className="h-10 w-full rounded-md bg-foreground text-background text-sm font-semibold hover:opacity-90 disabled:opacity-60"
                  >
                    {isResetSubmitting || pending ? "Resetting..." : "Reset password"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
