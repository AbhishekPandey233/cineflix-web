"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";

const maxSeats = 10;

type SeatData = {
  showtimeId: string;
  movieId: string;
  hallId: string;
  hallName: string;
  startTime: string;
  price: number;
  layout: {
    rows: string[];
    seatsPerRow: number;
    seatIds: string[];
  };
  bookedSeats: string[];
};

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Seat({
  label,
  selected,
  booked,
  disabled,
  onClick,
}: {
  label: string;
  selected: boolean;
  booked: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const base =
    "h-8 w-8 sm:h-9 sm:w-9 rounded-md border text-[10px] sm:text-xs font-semibold grid place-items-center " +
    "transition will-change-transform select-none";

  const bookedStyles = "bg-gray-600/40 border-gray-500/60 text-gray-400 cursor-not-allowed";
  const styles = "bg-white/5 border-white/15 text-white/85 hover:bg-white/10";
  const selectedStyles =
    "bg-emerald-500/25 border-emerald-400/70 text-emerald-100 hover:bg-emerald-500/30";

  return (
    <button
      className={cn(
        base,
        booked ? bookedStyles : selected ? selectedStyles : styles,
        disabled && !selected && !booked && "opacity-50 cursor-not-allowed",
        !disabled && !booked && "hover:scale-[1.03] active:scale-[0.98]"
      )}
      aria-label={`Seat ${label}`}
      type="button"
      disabled={booked || (disabled && !selected)}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function LegendDot({ className }: { className: string }) {
  return <span className={cn("inline-block h-3 w-3 rounded-sm border", className)} />;
}

export default function SeatSelectionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const showtimeId = searchParams.get("showtimeId");

  const [seatData, setSeatData] = useState<SeatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showBookingConfirm, setShowBookingConfirm] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!showtimeId) {
      setError("No showtime selected");
      setLoading(false);
      return;
    }

    const fetchSeatAvailability = async () => {
      try {
        const response = await axiosInstance.get(API.BOOKINGS.SEAT_AVAILABILITY(showtimeId));
        setSeatData(response.data.data);
      } catch (err: unknown) {
        let errorMessage = "Failed to load seats";
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

    fetchSeatAvailability();
  }, [showtimeId]);

  const selectedSet = useMemo(() => new Set(selectedSeats), [selectedSeats]);
  const bookedSet = useMemo(
    () => new Set(seatData?.bookedSeats || []),
    [seatData?.bookedSeats]
  );

  const limitReached = selectedSeats.length >= maxSeats;
  const price = seatData?.price || 0;
  const totalPrice = selectedSeats.length * price;

  const toggleSeat = (label: string) => {
    if (bookedSet.has(label)) return;

    setSelectedSeats((prev) => {
      const isSelected = prev.includes(label);
      if (isSelected) {
        return prev.filter((s) => s !== label);
      }
      if (prev.length >= maxSeats) {
        return prev;
      }
      return [...prev, label];
    });
  };

  const clearSelection = () => {
    setSelectedSeats([]);
    setShowClearConfirm(false);
  };

  const handleBooking = () => {
    if (selectedSeats.length === 0 || !showtimeId) return;
    setShowBookingConfirm(true);
  };

  const confirmBooking = async () => {
    if (selectedSeats.length === 0 || !showtimeId) return;

    setBooking(true);
    try {
      const response = await axiosInstance.post(API.BOOKINGS.CREATE, {
        showtimeId,
        seats: selectedSeats,
      });

      if (response.data.success) {
        setShowBookingConfirm(false);
        router.push(`/history?bookingId=${response.data.data._id}`);
      }
    } catch (err: unknown) {
      let errorMessage = "Booking failed";
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        if (axiosErr.response?.data?.message) {
          errorMessage = axiosErr.response.data.message;
        }
      }
      setError(errorMessage);
      setShowBookingConfirm(false);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen w-full bg-black text-white pt-14 flex items-center justify-center">
        <div>Loading seats...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen w-full bg-black text-white pt-14 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400">{error}</div>
          <Link href="/movies" className="mt-4 inline-block text-red-500 hover:text-red-400">
            ← Back to Movies
          </Link>
        </div>
      </main>
    );
  }

  if (!seatData) {
    return (
      <main className="min-h-screen w-full bg-black text-white pt-14 flex items-center justify-center">
        <div>No seat data available</div>
      </main>
    );
  }

  const { layout } = seatData;
  const { rows, seatsPerRow } = layout;

  return (
    <main className="min-h-screen w-full bg-black text-white">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-64 bg-gradient-to-b from-red-900/15 via-transparent to-transparent" />

      <section className="mx-auto w-full max-w-6xl px-5 pb-14 pt-10 sm:px-6 md:pt-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Select Your Seats</h1>
            <p className="mt-2 text-sm text-white/60">
              {new Date(seatData.startTime).toLocaleString()} • {seatData.hallName}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/movies"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10 hover:text-white"
            >
              ← Back to Movies
            </Link>
          </div>
        </div>

        {/* Screen */}
        <div className="mt-8">
          <div className="relative mx-auto w-[92%] max-w-4xl">
            <div className="absolute inset-0 -top-8 blur-2xl bg-white/5 rounded-full" />
            <svg viewBox="0 0 1200 140" className="relative h-12 w-full">
              <path
                d="M25,120 Q600,-10 1175,120"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="mx-auto -mt-2 w-fit rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] tracking-wide text-white/60">
            SCREEN THIS WAY
          </div>
        </div>

        {/* Layout */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
          {/* Seating */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-white/60">
                Tip: Seats closer to the center usually have the best view.
              </div>

              <div className="flex items-center gap-4 text-xs text-white/60">
                <span className="flex items-center gap-2">
                  <LegendDot className="bg-white/5 border-white/15" /> Available
                </span>
                <span className="flex items-center gap-2">
                  <LegendDot className="bg-emerald-500/25 border-emerald-400/70" /> Selected
                </span>
                <span className="flex items-center gap-2">
                  <LegendDot className="bg-gray-600/40 border-gray-500/60" /> Booked
                </span>
              </div>
            </div>

            {/* Seating grid */}
            <div className="space-y-3">
              {rows.map((row: string) => (
                <div key={row} className="flex items-center gap-3">
                  <div className="w-6 text-[11px] text-white/55">{row}</div>

                  <div className="flex flex-1 items-center justify-center">
                    <div className="flex flex-wrap justify-center gap-2">
                      {Array.from({ length: seatsPerRow }).map((_, i) => {
                        const seatNumber = i + 1;
                        const label = `${row}${seatNumber}`;
                        const isSelected = selectedSet.has(label);
                        const isBooked = bookedSet.has(label);
                        const isDisabled = !isSelected && selectedSeats.length >= maxSeats;
                        const isAisle = seatNumber === 7;

                        return (
                          <div key={label} className="flex items-center">
                            {isAisle && (
                              <div className="mx-2 hidden sm:block h-8 sm:h-9 w-[10px] rounded-full bg-white/5 border border-white/10" />
                            )}
                            <Seat
                              label={label}
                              selected={isSelected}
                              booked={isBooked}
                              disabled={isDisabled}
                              onClick={() => toggleSeat(label)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="w-6 text-[11px] text-white/55 text-right">{row}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-center gap-3 text-[11px] text-white/45">
              <span className="h-px w-16 bg-white/10" />
              Aisle
              <span className="h-px w-16 bg-white/10" />
            </div>
          </div>

          {/* Sticky summary */}
          <aside className="lg:sticky lg:top-6 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-sm font-semibold text-white/85">Your Selection</h2>
              {selectedSeats.length === 0 ? (
                <div className="mt-3 text-sm text-white/60">No seats selected</div>
              ) : (
                <div className="mt-3 space-y-2 text-sm text-white/70">
                  <div>{selectedSeats.length} seat(s) - ₹{totalPrice}</div>
                  <div className="text-xs text-white/50">{selectedSeats.join(", ")}</div>
                  {limitReached && (
                    <div className="text-[11px] text-amber-300/90">
                      Seat limit reached. Deselect to choose another.
                    </div>
                  )}
                </div>
              )}

              <div className="mt-5 space-y-2 text-xs text-white/60">
                <div className="flex items-center justify-between">
                  <span>Price per seat</span>
                  <span className="text-white/80">₹{price}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total</span>
                  <span className="text-white/80">₹{totalPrice}</span>
                </div>
              </div>

              <button
                className="mt-5 w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600 disabled:cursor-not-allowed"
                type="button"
                disabled={selectedSeats.length === 0 || booking}
                onClick={handleBooking}
              >
                {booking ? "Processing..." : "Book Seats"}
              </button>

              <button
                className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-white/5"
                type="button"
                disabled={selectedSeats.length === 0}
                onClick={() => setShowClearConfirm(true)}
              >
                Clear Selection
              </button>

              {error && <div className="mt-3 text-xs text-red-400">{error}</div>}

              <p className="mt-3 text-[11px] text-white/45">
                You can change seats before payment confirmation.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowClearConfirm(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-blue-200 bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-blue-900">Clear selection?</h3>
            <p className="mt-2 text-sm text-blue-700">This will deselect all chosen seats.</p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                type="button"
                onClick={() => setShowClearConfirm(false)}
              >
                Go Back
              </button>
              <button
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
                type="button"
                onClick={clearSelection}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showBookingConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowBookingConfirm(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-blue-300 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-blue-900">Confirm Booking</h3>
            <div className="mt-4 space-y-3 rounded-lg bg-blue-50 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Seats:</span>
                <span className="font-semibold text-blue-900">{selectedSeats.join(", ")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Quantity:</span>
                <span className="font-semibold text-blue-900">{selectedSeats.length}</span>
              </div>
              <div className="h-px bg-blue-200" />
              <div className="flex justify-between text-base">
                <span className="font-semibold text-blue-900">Total Price:</span>
                <span className="font-bold text-blue-600">₹{totalPrice}</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-blue-600">
              Please review your booking details before confirming.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                className="rounded-lg border border-blue-300 bg-blue-50 px-5 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                type="button"
                disabled={booking}
                onClick={() => setShowBookingConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
                disabled={booking}
                onClick={confirmBooking}
              >
                {booking ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
