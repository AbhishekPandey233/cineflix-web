"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axiosInstance from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";

type AdminUser = {
  _id: string;
  role?: "user" | "admin";
};

type AdminBooking = {
  _id: string;
  totalPrice?: number;
  status?: "confirmed" | "cancelled";
};

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    setError("");

    try {
      const [usersRes, bookingsRes] = await Promise.all([
        axiosInstance.get("/api/admin/users"),
        axiosInstance.get(API.ADMIN.BOOKINGS.ALL),
      ]);

      setUsers(usersRes.data?.data ?? []);
      setBookings(bookingsRes.data?.data ?? []);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const errorMessage =
        axiosErr?.response?.data?.message ||
        (err instanceof Error ? err.message : "Failed to load dashboard data");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalUsers = useMemo(
    () => users.filter((user) => (user.role ?? "user").toLowerCase() !== "admin").length,
    [users]
  );

  const totalBookings = bookings.length;

  const totalEarnings = useMemo(
    () =>
      bookings.reduce((sum, booking) => {
        if (booking.status !== "confirmed") return sum;
        return sum + (booking.totalPrice ?? 0);
      }, 0),
    [bookings]
  );

  const roundedEarnings = useMemo(() => Math.round(totalEarnings), [totalEarnings]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-400">Overview of key admin metrics</p>
        </div>
        <button
          onClick={fetchStats}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-blue-400/20 bg-blue-500/10 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-200/80">Total Users</p>
          <p className="mt-3 text-3xl font-bold text-white">{loading ? "..." : totalUsers}</p>
          <p className="mt-2 text-xs text-blue-100/70">Non-admin registered users</p>
        </div>

        <div className="rounded-xl border border-purple-400/20 bg-purple-500/10 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-purple-200/80">Total Bookings</p>
          <p className="mt-3 text-3xl font-bold text-white">{loading ? "..." : totalBookings}</p>
          <p className="mt-2 text-xs text-purple-100/70">All bookings in the system</p>
        </div>

        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-200/80">Total Earnings</p>
          <p className="mt-3 text-3xl font-bold text-white">{loading ? "..." : `₹${roundedEarnings.toLocaleString()}`}</p>
          <p className="mt-2 text-xs text-emerald-100/70">From confirmed bookings</p>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl font-bold tracking-tight">Quick Links</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Link
            href="/admin/users"
            className="rounded-xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
          >
            <p className="text-lg font-semibold text-white">User Management</p>
            <p className="mt-1 text-sm text-neutral-300">View and manage all users</p>
          </Link>

          <Link
            href="/admin/bookings"
            className="rounded-xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
          >
            <p className="text-lg font-semibold text-white">Booking Management</p>
            <p className="mt-1 text-sm text-neutral-300">View and manage all bookings</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
