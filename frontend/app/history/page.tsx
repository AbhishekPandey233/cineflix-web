export default function HistoryPage() {
  return (
    <main className="min-h-screen w-full bg-black text-white pt-14">
      <section className="mx-auto w-full max-w-4xl px-6 py-14">
        <h1 className="text-3xl font-bold">Booking History</h1>
        <p className="mt-2 text-white/60">This is a placeholder page for your booking history.</p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm text-white/70">No bookings yet</div>
          <p className="mt-2 text-xs text-white/50">
            Your past tickets and receipts will appear here.
          </p>
        </div>
      </section>
    </main>
  );
}
