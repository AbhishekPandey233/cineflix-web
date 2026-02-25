"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import QRCode from "qrcode";
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
  paymentStatus?: "unpaid" | "pending" | "paid";
  canceledBy?: "user" | "admin";
  createdAt: string;
};

export default function HistoryPage() {
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCancelBookingId, setSelectedCancelBookingId] = useState<string | null>(null);
  const [cancelingBookingId, setCancelingBookingId] = useState<string | null>(null);
  const [payingBookingId, setPayingBookingId] = useState<string | null>(null);
  const [downloadingTicketId, setDownloadingTicketId] = useState<string | null>(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState("");

  const fetchBookings = useCallback(async () => {
    try {
      const response = await axiosInstance.get(API.BOOKINGS.USER_HISTORY);
      setBookings(response.data.data || []);
      setError("");
    } catch (err: unknown) {
      let errorMessage = "Failed to load bookings";
      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        if (axiosErr.response?.data?.message) {
          errorMessage = axiosErr.response.data.message;
        }
      }
      setError(errorMessage);
    }
  }, []);

  useEffect(() => {
    const loadBookings = async () => {
      await fetchBookings();
      setLoading(false);
    };

    loadBookings();
  }, [fetchBookings]);

  useEffect(() => {
    const bookingId = searchParams.get("bookingId");
    const pidx = searchParams.get("pidx");
    const status = searchParams.get("status");

    if (!bookingId || !pidx) {
      return;
    }

    if (status && status.toLowerCase() !== "completed") {
      setError("Payment was not completed.");
      window.history.replaceState({}, "", "/history");
      return;
    }

    const verifyPayment = async () => {
      setVerifyingPayment(true);
      try {
        await axiosInstance.post(API.BOOKINGS.KHALTI_VERIFY(bookingId), { pidx });
        await fetchBookings();
        setPaymentNotice("Payment completed successfully.");
      } catch (err: unknown) {
        let errorMessage = "Failed to verify payment";
        if (typeof err === "object" && err !== null && "response" in err) {
          const axiosErr = err as { response?: { data?: { message?: string } } };
          if (axiosErr.response?.data?.message) {
            errorMessage = axiosErr.response.data.message;
          }
        }
        setError(errorMessage);
      } finally {
        setVerifyingPayment(false);
        window.history.replaceState({}, "", "/history");
      }
    };

    verifyPayment();
  }, [fetchBookings, searchParams]);

  const handlePay = async (bookingId: string) => {
    setPayingBookingId(bookingId);
    try {
      const response = await axiosInstance.post(API.BOOKINGS.KHALTI_INITIATE(bookingId));
      const paymentUrl = response?.data?.data?.paymentUrl;

      if (!paymentUrl) {
        throw new Error("Payment URL was not returned by server");
      }

      window.location.href = paymentUrl;
    } catch (err: unknown) {
      let errorMessage = "Failed to initiate Khalti payment";
      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        if (axiosErr.response?.data?.message) {
          errorMessage = axiosErr.response.data.message;
        }
      } else if (err instanceof Error && err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setPayingBookingId(null);
    }
  };

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

  const handleDownloadTicket = async (booking: Booking) => {
    setDownloadingTicketId(booking._id);
    try {
      const ticketData = {
        ticketId: booking._id,
        movie: booking.showtimeId.movieId.title,
        hall: booking.showtimeId.hallName,
        showtime: booking.showtimeId.startTime,
        seats: booking.seats,
        totalPrice: booking.totalPrice,
        status: booking.status,
        bookedOn: booking.createdAt,
      };

      const qrCanvas = document.createElement("canvas");
      await QRCode.toCanvas(qrCanvas, JSON.stringify(ticketData), {
        width: 220,
        margin: 1,
        color: {
          dark: "#FFFFFF",
          light: "#00000000",
        },
      });

      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 700;
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Could not initialize ticket canvas");
      }

      context.fillStyle = "#020617";
      context.fillRect(0, 0, canvas.width, canvas.height);

      const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "rgba(239, 68, 68, 0.20)");
      gradient.addColorStop(0.5, "rgba(15, 23, 42, 0.05)");
      gradient.addColorStop(1, "rgba(15, 23, 42, 0.5)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.strokeStyle = "rgba(255, 255, 255, 0.16)";
      context.lineWidth = 2;
      context.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

      context.fillStyle = "#ef4444";
      context.font = "bold 56px Inter, Arial, sans-serif";
      context.fillText("CineFlix", 80, 130);

      context.fillStyle = "#FFFFFF";
      context.font = "bold 42px Inter, Arial, sans-serif";
      context.fillText("E-Ticket", 80, 185);

      context.fillStyle = "rgba(255,255,255,0.75)";
      context.font = "24px Inter, Arial, sans-serif";
      context.fillText("Movie", 80, 260);
      context.fillStyle = "#FFFFFF";
      context.font = "bold 34px Inter, Arial, sans-serif";
      context.fillText(booking.showtimeId.movieId.title, 80, 304);

      context.fillStyle = "rgba(255,255,255,0.75)";
      context.font = "24px Inter, Arial, sans-serif";
      context.fillText("Showtime", 80, 370);
      context.fillStyle = "#FFFFFF";
      context.font = "bold 28px Inter, Arial, sans-serif";
      context.fillText(new Date(booking.showtimeId.startTime).toLocaleString(), 80, 410);

      context.fillStyle = "rgba(255,255,255,0.75)";
      context.font = "24px Inter, Arial, sans-serif";
      context.fillText("Hall", 80, 470);
      context.fillStyle = "#FFFFFF";
      context.font = "bold 28px Inter, Arial, sans-serif";
      context.fillText(booking.showtimeId.hallName, 80, 510);

      context.fillStyle = "rgba(255,255,255,0.75)";
      context.font = "24px Inter, Arial, sans-serif";
      context.fillText("Seats", 420, 470);
      context.fillStyle = "#FFFFFF";
      context.font = "bold 28px Inter, Arial, sans-serif";
      context.fillText(booking.seats.join(", "), 420, 510);

      context.fillStyle = "rgba(255,255,255,0.75)";
      context.font = "24px Inter, Arial, sans-serif";
      context.fillText("Total", 80, 570);
      context.fillStyle = "#22c55e";
      context.font = "bold 32px Inter, Arial, sans-serif";
      context.fillText(`₹${booking.totalPrice}`, 80, 612);

      context.fillStyle = "rgba(255,255,255,0.75)";
      context.font = "20px Inter, Arial, sans-serif";
      context.fillText(`Booking ID: ${booking._id.slice(-8).toUpperCase()}`, 420, 612);

      context.strokeStyle = "rgba(255,255,255,0.22)";
      context.setLineDash([8, 8]);
      context.beginPath();
      context.moveTo(820, 90);
      context.lineTo(820, 610);
      context.stroke();
      context.setLineDash([]);

      context.drawImage(qrCanvas, 900, 230, 220, 220);
      context.fillStyle = "rgba(255,255,255,0.75)";
      context.font = "18px Inter, Arial, sans-serif";
      context.fillText("Scan for ticket verification", 875, 490);

      context.fillStyle = "rgba(255,255,255,0.55)";
      context.font = "16px Inter, Arial, sans-serif";
      context.fillText(`Booked on ${new Date(booking.createdAt).toLocaleString()}`, 80, 650);

      const downloadLink = document.createElement("a");
      downloadLink.href = canvas.toDataURL("image/png");
      downloadLink.download = `cineflix-ticket-${booking._id.slice(-8)}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch {
      setError("Failed to download ticket. Please try again.");
    } finally {
      setDownloadingTicketId(null);
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

        {verifyingPayment && (
          <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">
            Verifying your Khalti payment...
          </div>
        )}

        {paymentNotice && (
          <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">
            {paymentNotice}
          </div>
        )}

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
                      {booking.paymentStatus === "paid" ? (
                        <span className="inline-flex items-center rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-100">
                          PAID
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-100">
                          UNPAID
                        </span>
                      )}
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
                      <button
                        onClick={() => handleDownloadTicket(booking)}
                        disabled={downloadingTicketId === booking._id}
                        className="inline-flex items-center justify-center rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {downloadingTicketId === booking._id ? "Preparing..." : "Download Ticket"}
                      </button>
                      <button
                        onClick={() => setSelectedCancelBookingId(booking._id)}
                        className="inline-flex items-center justify-center rounded-lg bg-red-600/20 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-600/30"
                      >
                        Cancel Booking
                      </button>
                      {booking.paymentStatus !== "paid" && (
                        <button
                          onClick={() => handlePay(booking._id)}
                          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={payingBookingId === booking._id || verifyingPayment}
                        >
                          {payingBookingId === booking._id ? "Redirecting..." : "Pay"}
                        </button>
                      )}
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
