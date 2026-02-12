"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
const seatsPerRow = 12;
const maxSeats = 10;
const prices = {
  standard: 350,
  premium: 500,
  vip: 700,
} as const;

// Example tiers
const premiumRows = new Set(["E", "F", "G"]);
const vipRows = new Set<string>(); // add rows if needed

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type SeatVariant = "standard" | "premium" | "vip";

function Seat({
  label,
  variant,
  selected,
  disabled,
  onClick,
}: {
  label: string;
  variant: SeatVariant;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const base =
    "h-8 w-8 sm:h-9 sm:w-9 rounded-md border text-[10px] sm:text-xs font-semibold grid place-items-center " +
    "transition will-change-transform select-none";

  const styles =
    variant === "premium"
      ? "bg-red-600/15 border-red-500/60 text-red-100 hover:bg-red-600/25"
      : variant === "vip"
      ? "bg-amber-500/15 border-amber-400/60 text-amber-100 hover:bg-amber-500/25"
      : "bg-white/5 border-white/15 text-white/85 hover:bg-white/10";

  const selectedStyles =
    "bg-emerald-500/25 border-emerald-400/70 text-emerald-100 hover:bg-emerald-500/30";

  return (
    <button
      className={cn(
        base,
        selected ? selectedStyles : styles,
        disabled && !selected && "opacity-50 cursor-not-allowed",
        !disabled && "hover:scale-[1.03] active:scale-[0.98]"
      )}
      aria-label={`Seat ${label}`}
      type="button"
      disabled={disabled && !selected}
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
  const [selectedSeats, setSelectedSeats] = useState<
    Array<{ label: string; variant: SeatVariant }>
  >([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const selectedSet = useMemo(
    () => new Set(selectedSeats.map((seat) => seat.label)),
    [selectedSeats]
  );

  const counts = useMemo(() => {
    return selectedSeats.reduce(
      (acc, seat) => {
        acc[seat.variant] += 1;
        return acc;
      },
      { standard: 0, premium: 0, vip: 0 }
    );
  }, [selectedSeats]);

  const total =
    counts.standard * prices.standard +
    counts.premium * prices.premium +
    counts.vip * prices.vip;

  const limitReached = selectedSeats.length >= maxSeats;

  const toggleSeat = (label: string, variant: SeatVariant) => {
    setSelectedSeats((prev) => {
      const isSelected = prev.some((seat) => seat.label === label);
      if (isSelected) {
        return prev.filter((seat) => seat.label !== label);
      }
      if (prev.length >= maxSeats) {
        return prev;
      }
      return [...prev, { label, variant }];
    });
  };

  const clearSelection = () => {
    setSelectedSeats([]);
    setShowClearConfirm(false);
  };

  return (
    <main className="min-h-screen w-full bg-black text-white">
      {/* Top gradient */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-64 bg-gradient-to-b from-red-900/15 via-transparent to-transparent" />

      <section className="mx-auto w-full max-w-6xl px-5 pb-14 pt-10 sm:px-6 md:pt-14">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Select Your Seats
            </h1>
            <p className="mt-2 text-sm text-white/60">
              Pick seats and proceed to booking.
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

        {/* Layout: seats + sticky panel */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
          {/* Seating */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
            {/* Optional row/seat hints */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-white/60">
                Tip: Seats closer to the center usually have the best view.
              </div>

              <div className="flex items-center gap-4 text-xs text-white/60">
                <span className="flex items-center gap-2">
                  <LegendDot className="bg-white/5 border-white/15" /> Standard
                </span>
                <span className="flex items-center gap-2">
                  <LegendDot className="bg-red-600/15 border-red-500/60" /> Premium
                </span>
                <span className="flex items-center gap-2">
                  <LegendDot className="bg-amber-500/15 border-amber-400/60" /> VIP
                </span>
              </div>
            </div>

            {/* Seating grid */}
            <div className="space-y-3">
              {rows.map((row) => {
                const variant: SeatVariant = premiumRows.has(row)
                  ? "premium"
                  : vipRows.has(row)
                  ? "vip"
                  : "standard";

                return (
                  <div key={row} className="flex items-center gap-3">
                    {/* Left row label */}
                    <div className="w-6 text-[11px] text-white/55">{row}</div>

                    {/* Seats */}
                    <div className="flex flex-1 items-center justify-center">
                      {/* Split into two blocks with a center aisle */}
                      <div className="flex flex-wrap justify-center gap-2">
                        {Array.from({ length: seatsPerRow }).map((_, i) => {
                          const seatNumber = i + 1;
                          const label = `${row}${seatNumber}`;
                          const isSelected = selectedSet.has(label);
                          const isDisabled = !isSelected && selectedSeats.length >= maxSeats;

                          // aisle after seat 6 (for 12 total)
                          const isAisle = seatNumber === 7;

                          return (
                            <div key={label} className="flex items-center">
                              {isAisle && (
                                <div className="mx-2 hidden sm:block h-8 sm:h-9 w-[10px] rounded-full bg-white/5 border border-white/10" />
                              )}
                              <Seat
                                label={label}
                                variant={variant}
                                selected={isSelected}
                                disabled={isDisabled}
                                onClick={() => toggleSeat(label, variant)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right row label */}
                    <div className="w-6 text-[11px] text-white/55 text-right">{row}</div>
                  </div>
                );
              })}
            </div>

            {/* Aisle label */}
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
                  <div>{selectedSeats.length} seats selected</div>
                  <div className="text-xs text-white/50">
                    {selectedSeats.map((seat) => seat.label).join(", ")}
                  </div>
                  <div className="text-[11px] text-white/45">
                    Max {maxSeats} seats per booking
                  </div>
                  {limitReached && (
                    <div className="text-[11px] text-amber-300/90">
                      Seat limit reached. Deselect to choose another.
                    </div>
                  )}
                </div>
              )}

              <div className="mt-5 space-y-2 text-xs text-white/60">
                <div className="flex items-center justify-between">
                  <span>Standard</span>
                  <span>
                    {counts.standard} x {prices.standard}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Premium</span>
                  <span>
                    {counts.premium} x {prices.premium}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>VIP</span>
                  <span>
                    {counts.vip} x {prices.vip}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total</span>
                  <span className="text-white/80">{total}</span>
                </div>
              </div>

              <button
                className="mt-5 w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600"
                type="button"
                disabled={selectedSeats.length === 0}
              >
                Continue
              </button>

              <button
                className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-white/5"
                type="button"
                disabled={selectedSeats.length === 0}
                onClick={() => setShowClearConfirm(true)}
              >
                Deselect All
              </button>

              <p className="mt-3 text-[11px] text-white/45">
                You can change seats anytime before payment.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-sm font-semibold text-white/85">Need help?</h3>
              <p className="mt-2 text-xs text-white/60">
                Premium rows are highlighted. VIP can be enabled per row set.
              </p>
            </div>
          </aside>
        </div>

        {/* Mobile bottom CTA */}
        <div className="mt-8 lg:hidden">
          <button
            className="w-full rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700"
            type="button"
          >
            Book Seat
          </button>
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
            <p className="mt-2 text-sm text-blue-700">
              This will deselect all chosen seats.
            </p>
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
    </main>
  );
}
