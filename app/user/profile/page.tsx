export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-black text-white pt-14">
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="mt-2 text-white/70">
          Update your details, view bookings, and manage settings.
        </p>

        <div className="mt-6 rounded-xl border border-white/15 bg-white/10 p-6">
          <div className="text-white/90">Profile content goes here…</div>
        </div>
      </div>
    </div>
  );
}
