"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function ProfileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Profile panel"
        className={`fixed right-0 top-0 z-[70] h-dvh w-[88%] max-w-sm bg-black/90 backdrop-blur-xl shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between px-4">
          <div className="text-red-500 font-semibold text-lg">Your Profile</div>

          <button
            onClick={onClose}
            className="h-9 w-9 rounded-md bg-white/10 text-white hover:bg-white/20"
            aria-label="Close profile panel"
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          {/* User Card */}
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-red-600 to-red-700 grid place-items-center text-white font-bold">
                U
              </div>
              <div>
                <div className="text-white font-semibold">User</div>
                <div className="text-white/60 text-sm">user@email.com</div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Link
                href="/user/profile"
                onClick={onClose}
                className="flex-1 h-9 inline-flex items-center justify-center rounded-md bg-red-600 text-sm font-semibold text-white hover:bg-red-700"
              >
                View Profile
              </Link>

              <Link
                href="/logout"
                onClick={onClose}
                className="flex-1 h-9 inline-flex items-center justify-center rounded-md bg-white/10 text-sm font-semibold text-white hover:bg-white/20"
              >
                Logout
              </Link>
            </div>
          </div>

          {/* Menu */}
          <div className="mt-4 space-y-2">
            <Link
              href="/user/profile"
              onClick={onClose}
              className="block rounded-lg bg-white/10 px-4 py-3 text-white hover:bg-white/20 transition"
            >
              My Profile
              <div className="text-xs text-white/60">Edit details & avatar</div>
            </Link>

            <Link
              href="/user/bookings"
              onClick={onClose}
              className="block rounded-lg bg-white/10 px-4 py-3 text-white hover:bg-white/20 transition"
            >
              My Bookings
              <div className="text-xs text-white/60">Tickets & history</div>
            </Link>

            <Link
              href="/user/settings"
              onClick={onClose}
              className="block rounded-lg bg-white/10 px-4 py-3 text-white hover:bg-white/20 transition"
            >
              Settings
              <div className="text-xs text-white/60">Password & preferences</div>
            </Link>

            <Link
              href="/help"
              onClick={onClose}
              className="block rounded-lg bg-white/10 px-4 py-3 text-white hover:bg-white/20 transition"
            >
              Help
              <div className="text-xs text-white/60">Support center</div>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function Header() {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-md">
      <div className="relative mx-auto flex h-14 max-w-6xl items-center px-4">
        {/* Logo */}
        <Link href="/" className="mr-auto pl-2 text-lg font-semibold text-red-500">
          CineFlix
        </Link>

        {/* Center Nav */}
        <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-6 rounded-full bg-white/10 px-6 py-2 text-sm text-white backdrop-blur-md">
          <Link href="/home" className="hover:text-red-500 transition">
            Home
          </Link>
          <Link href="/about" className="hover:text-red-500 transition">
            About
          </Link>
          <Link href="/movies" className="hover:text-red-500 transition">
            Movies
          </Link>
          <Link href="/ticket-rate" className="hover:text-red-500 transition">
            Ticket Rate
          </Link>
        </nav>

        {/* Right Buttons */}
        <div className="ml-auto flex items-center gap-3 pr-2">
          <Link
            href="/login"
            className="h-9 inline-flex items-center justify-center rounded-md bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/20"
          >
            Log in
          </Link>

          <Link
            href="/register"
            className="h-9 inline-flex items-center justify-center rounded-md bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
          >
            Sign up
          </Link>

          <button
            onClick={() => setProfileOpen(true)}
            className="h-9 inline-flex items-center justify-center rounded-md bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/20"
            aria-label="Open profile panel"
          >
            Profile
          </button>
        </div>
      </div>

      {/* Profile Drawer */}
      <ProfileDrawer open={profileOpen} onClose={() => setProfileOpen(false)} />
    </header>
  );
}
