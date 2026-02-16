"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axiosInstance from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";

type Booking = {
  _id: string;
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
  status: string;
  canceledBy?: "user" | "admin";
  createdAt: string;
};

export default function HistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCancelBookingId, setSelectedCancelBookingId] = useState<string | null>(null);
  const [cancelingBookingId, setCancelingBookingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axiosInstance.get(API.BOOKINGS.USER_HISTORY);
        setBookings(response.data.data || []);
      } catch (err: unknown) {
        let errorMessage = "Failed to load bookings";
        if (typeof err === 'object' && err !== null && 'response' in err) {
          const axiosErr = err as { response?: { data?: { message?: string } } };
          if (axiosErr.response?.data?.message) {
            errorMessage = axiosErr.response.data.message;
          }
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    setCancelingBookingId(bookingId);
    try {
      await axiosInstance.delete(API.BOOKINGS.CANCEL(bookingId));
      setBookings(bookings.filter(b => b._id !== bookingId));
      setSelectedCancelBookingId(null);
    } catch (err: unknown) {
      let errorMessage = "Failed to cancel booking";
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        if (axiosErr.response?.data?.message) {
          errorMessage = axiosErr.response.data.message;
        }
      }
      setError(errorMessage);
      setSelectedCancelBookingId(null);
    } finally {
      setCancelingBookingId(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen w-full bg-black text-white pt-14 flex items-center justify-center">
        <div>Loading bookings...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-black text-white pt-14">
      <section className="mx-auto w-full max-w-4xl px-6 py-14">
        <h1 className="text-3xl font-bold">Booking History</h1>
        <p className="mt-2 text-white/60">View your booked tickets and details.</p>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-white/70">No bookings yet</div>
            <p className="mt-2 text-xs text-white/50">
              Your past tickets and receipts will appear here once you book seats.
            </p>
            <Link
              href="/movies"
              className="mt-4 inline-block rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Book Now
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">
                        {booking.showtimeId.movieId.title}
                      </h3>
                      <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100">
                        {booking.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="mt-3 space-y-2 text-sm text-white/70">
                      <div>
                        <span className="text-white/60">Booking ID: </span>
                        {booking._id.slice(-8)}
                      </div>
                      <div>
                        <span className="text-white/60">Showtime: </span>
                        {new Date(booking.showtimeId.startTime).toLocaleString()}
                      </div>
                      <div>
                        <span className="text-white/60">Hall: </span>
                        {booking.showtimeId.hallName}
                      </div>
                      <div>
                        <span className="text-white/60">Seats: </span>
                        {booking.seats.join(", ")}
                      </div>
                      <div>
                        <span className="text-white/60">Booked on: </span>
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </div>
                      {booking.canceledBy === "admin" && (
                        <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <p className="text-sm text-amber-200">
                            Canceled by admin sorry for the inconvenience
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">₹{booking.totalPrice}</div>
                    <div className="mt-2 text-xs text-white/60">
                      {booking.seats.length} {booking.seats.length === 1 ? "seat" : "seats"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-3 border-t border-white/10 pt-4">
                  {booking.status === "confirmed" ? (
                    <>
                      <Link
                        href="/movies"
                        className="inline-flex items-center justify-center rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
                      >
                        Book Again
                      </Link>
                      <button className="inline-flex items-center justify-center rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20">
                        Download Ticket
                      </button>
                      <button
                        onClick={() => setSelectedCancelBookingId(booking._id)}
                        className="inline-flex items-center justify-center rounded-lg bg-red-600/20 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-600/30"
                      >
                        Cancel Booking
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/movies"
                      className="inline-flex items-center justify-center rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
                    >
                      Book Again
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedCancelBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setSelectedCancelBookingId(null)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-red-300 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-red-900">Cancel Booking?</h3>
            <p className="mt-3 text-sm text-red-800">
              Are you sure you want to cancel this booking? The seats will be released and available for other users to book.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                className="rounded-lg border border-red-300 bg-red-50 px-5 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                type="button"
                disabled={cancelingBookingId === selectedCancelBookingId}
                onClick={() => setSelectedCancelBookingId(null)}
              >
                Keep Booking
              </button>
              <button
                className="rounded-lg bg-red-600 px-5 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
                disabled={cancelingBookingId === selectedCancelBookingId}
                onClick={() => handleCancelBooking(selectedCancelBookingId)}
              >
                {cancelingBookingId === selectedCancelBookingId ? "Cancelling..." : "Cancel Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
