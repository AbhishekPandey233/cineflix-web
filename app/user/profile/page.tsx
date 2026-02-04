"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type User = {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  avatar?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/user/profile");
        if (!res.ok) {
          setUser(null);
          setMessage({ type: "error", text: "You are not logged in. Please log in to view your profile." });
          return;
        }

        const data = await res.json();
        if (mounted) {
          setUser(data.data ?? null);
          setName(data.data?.name ?? "");
          setEmail(data.data?.email ?? "");
        }
      } catch (err) {
        setMessage({ type: "error", text: "Could not load profile" });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUser();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setMessage({ type: "error", text: data.message || "Failed to update profile" });
      } else {
        setUser(data.data);
        setMessage({ type: "success", text: "Profile updated" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Unexpected error" });
    } finally {
      setSaving(false);
    }
  };

  const initials = (user?.name ?? "U").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-black text-white pt-14">
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="mt-2 text-white/70">Update your details, view bookings, and manage settings.</p>

        <div className="mt-6 rounded-xl border border-white/15 bg-white/10 p-6">
          {loading ? (
            <div className="text-white/60">Loading…</div>
          ) : user ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="col-span-1 flex flex-col items-center gap-4">
                <div className="relative">
                  {user.avatar ? (
                    <img src={user.avatar} alt="avatar" className="h-28 w-28 rounded-full object-cover" />
                  ) : (
                    <div className="h-28 w-28 rounded-full bg-gradient-to-r from-red-600 to-red-700 grid place-items-center text-white text-2xl font-bold">
                      {initials}
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <div className="text-white font-semibold">{user.name}</div>
                  <div className="text-white/60 text-sm">{user.email}</div>
                </div>
                <div className="text-xs text-white/60">Role: <span className="text-white/80">{user.role ?? "user"}</span></div>

                {/* Avatar upload UI */}
                <div className="w-full">
                  <label className="mt-3 block text-sm text-white/70">Profile picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0] ?? null;
                      if (!file) return;

                      // simple validation
                      const maxSize = 2 * 1024 * 1024; // 2MB
                      if (!file.type.startsWith("image/")) {
                        setMessage({ type: "error", text: "Please select an image file" });
                        return;
                      }
                      if (file.size > maxSize) {
                        setMessage({ type: "error", text: "File too large (max 2MB)" });
                        return;
                      }

                      // preview
                      const preview = URL.createObjectURL(file);
                      setMessage(null);

                      // upload
                      setSaving(true);
                      try {
                        const fd = new FormData();
                        fd.append("avatar", file);

                        const res = await fetch("/api/user/avatar", {
                          method: "POST",
                          body: fd,
                        });

                        const data = await res.json();
                        if (!res.ok || !data.success) {
                          setMessage({ type: "error", text: data?.message || "Upload failed" });
                        } else {
                          // update UI immediately
                          setUser((u) => (u ? { ...u, avatar: data.url } : u));
                          setMessage({ type: "success", text: "Avatar uploaded" });
                        }

                        // release preview URL
                        URL.revokeObjectURL(preview);
                      } catch (err) {
                        setMessage({ type: "error", text: "Upload error" });
                      } finally {
                        setSaving(false);
                      }
                    }}
                    className="mt-2 w-full text-sm text-white"
                  />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="col-span-2 space-y-4">
                {message && (
                  <div className={`rounded-md px-4 py-2 ${message.type === "success" ? "bg-green-700/30 text-green-300" : "bg-red-700/30 text-red-300"}`}>
                    {message.text}
                  </div>
                )}

                <label className="block">
                  <div className="mb-2 text-sm text-white/70">Name</div>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md bg-white/5 px-3 py-2 text-white" />
                </label>

                <label className="block">
                  <div className="mb-2 text-sm text-white/70">Email</div>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md bg-white/5 px-3 py-2 text-white" />
                </label>

                <div className="flex items-center gap-3">
                  <button type="submit" disabled={saving} className="h-10 inline-flex items-center justify-center rounded-md bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                    {saving ? "Saving…" : "Save changes"}
                  </button>

                  <Link href="/user/bookings" className="text-sm text-white/80 hover:underline">
                    View Bookings
                  </Link>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <div className="mb-4 text-white/70">You are not signed in.</div>
              <Link href="/login" className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-white">
                Log in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
