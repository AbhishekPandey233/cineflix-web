"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";

type AdminBooking = {
  _id: string;
  userId: {
    _id: string;
    email: string;
    fullName: string;
  };
  showtimeId: {
    _id: string;
    movieId: {
      _id: string;
      title: string;
    };
    hallId: string;
    hallName: string;
    startTime: string;
    price: number;
  };
  seats: string[];
  totalPrice: number;
  status: "confirmed" | "cancelled";
  canceledBy?: "user" | "admin";
  createdAt: string;
  updatedAt: string;
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [selectedCancelBookingId, setSelectedCancelBookingId] = useState<
    string | null
  >(null);
  const [cancelingBookingId, setCancelingBookingId] = useState<string | null>(
    null
  );
  const [filter, setFilter] = useState<"all" | "confirmed" | "cancelled">(
    "all"
  );

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get(API.ADMIN.BOOKINGS.ALL);
      setBookings(res.data?.data ?? []);
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string } };
      };
      const errorMessage =
        axiosErr?.response?.data?.message ||
        (err instanceof Error ? err.message : "Failed to load bookings");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    setCancelingBookingId(bookingId);
    try {
      await axiosInstance.delete(API.ADMIN.BOOKINGS.CANCEL(bookingId));
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId
            ? { ...b, status: "cancelled", canceledBy: "admin" }
            : b
        )
      );
      setSelectedCancelBookingId(null);
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string } };
      };
      const errorMessage =
        axiosErr?.response?.data?.message ||
        (err instanceof Error ? err.message : "Failed to cancel booking");
      setError(errorMessage);
    } finally {
      setCancelingBookingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === "confirmed") return b.status === "confirmed";
    if (filter === "cancelled") return b.status === "cancelled";
    return true;
  });

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredBookings.length / pageSize));
    if (page > totalPages) setPage(totalPages);
  }, [filteredBookings.length, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredBookings.length);
  const pageBookings = filteredBookings.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">All Bookings</h1>
        <p className="text-sm text-neutral-400 mt-2">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Manage all customer bookings
          </p>
        </div>
        <div className="text-sm text-neutral-400">
          Total: {filteredBookings.length}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
            filter === "all"
              ? "bg-red-600 text-white"
              : "border border-white/10 bg-white/5 hover:bg-white/10"
          }`}
        >
          All ({bookings.length})
        </button>
        <button
          onClick={() => setFilter("confirmed")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
            filter === "confirmed"
              ? "bg-emerald-600 text-white"
              : "border border-white/10 bg-white/5 hover:bg-white/10"
          }`}
        >
          Confirmed ({bookings.filter((b) => b.status === "confirmed").length})
        </button>
        <button
          onClick={() => setFilter("cancelled")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
            filter === "cancelled"
              ? "bg-red-600 text-white"
              : "border border-white/10 bg-white/5 hover:bg-white/10"
          }`}
        >
          Cancelled ({bookings.filter((b) => b.status === "cancelled").length})
        </button>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-white/70">No bookings found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03]">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-neutral-400">
                  Movie
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-neutral-400">
                  Customer
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-neutral-400">
                  Showtime
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-neutral-400">
                  Seats
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-neutral-400">
                  Price
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-neutral-400">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-neutral-400 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pageBookings.map((booking) => (
                <tr
                  key={booking._id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-white">
                    {booking.showtimeId.movieId.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-white/80">
                    <div className="font-medium">{booking.userId.fullName}</div>
                    <div className="text-xs text-white/60">{booking.userId.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/80">
                    <div>{new Date(booking.showtimeId.startTime).toLocaleString()}</div>
                    <div className="text-xs text-white/60">
                      {booking.showtimeId.hallName}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/80">
                    {booking.seats.join(", ")}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-white">
                    ₹{booking.totalPrice}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          booking.status === "confirmed"
                            ? "bg-emerald-500/20 text-emerald-100"
                            : "bg-red-500/20 text-red-100"
                        }`}
                      >
                        {booking.status.toUpperCase()}
                      </span>
                      {booking.canceledBy === "admin" && (
                        <span className="text-xs text-amber-400 italic">
                          By admin
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {booking.status === "confirmed" && (
                      <button
                        onClick={() => setSelectedCancelBookingId(booking._id)}
                        className="px-3 py-1.5 text-xs font-bold rounded-md bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 transition"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && filteredBookings.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mt-6 text-sm text-neutral-400">
          <div>
            Showing <span className="text-white">{startIndex + 1}</span> to <span className="text-white">{endIndex}</span> of{" "}
            <span className="text-white">{filteredBookings.length}</span> bookings
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const num = idx + 1;
                const isActive = num === page;
                return (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition ${isActive ? "bg-red-600 text-white border-red-500" : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"}`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedCancelBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setSelectedCancelBookingId(null)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-red-500/30 bg-neutral-900 p-6 text-white shadow-2xl">
            <h3 className="text-lg font-bold text-red-400">Cancel Booking?</h3>
            <p className="mt-3 text-sm text-white/75">
              The customer will be notified: &quot;Canceled by admin sorry for the
              inconvenience&quot;. Seats will become available for other users.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                className="rounded-lg border border-white/15 bg-white/5 px-5 py-2 text-xs font-semibold text-white/85 hover:bg-white/10 disabled:opacity-50"
                type="button"
                disabled={
                  cancelingBookingId === selectedCancelBookingId
                }
                onClick={() => setSelectedCancelBookingId(null)}
              >
                Keep Booking
              </button>
              <button
                className="rounded-lg bg-red-600 px-5 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
                disabled={
                  cancelingBookingId === selectedCancelBookingId
                }
                onClick={() =>
                  selectedCancelBookingId &&
                  handleCancelBooking(selectedCancelBookingId)
                }
              >
                {cancelingBookingId === selectedCancelBookingId
                  ? "Cancelling..."
                  : "Cancel Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
