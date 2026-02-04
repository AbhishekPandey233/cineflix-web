"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axiosInstance from "@/lib/api/axios";

type User = {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  avatar?: string;
  image?: string; // backend stored relative path (/uploads/users/..)
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Build full URL from backend-stored image path
  const buildImageUrl = (path?: string | null) => {
    if (!path) return null;
    const baseFromEnv = process.env.NEXT_PUBLIC_API_BASE_URL ?? undefined;
    const baseFromAxios = axiosInstance.defaults.baseURL ?? undefined;
    const fallback = typeof window !== "undefined" ? `${window.location.protocol}//${window.location.hostname}:5000` : "";
    const base = baseFromEnv || baseFromAxios || fallback || "";
    if (!base) return path;
    const cleanedBase = base.replace(/\/$/, "");
    return `${cleanedBase}${path.startsWith("/") ? path : `/${path}`}`;
  }

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/api/user/profile");
        const data = res.data;
        if (mounted) {
          const profile = data.data ?? null;
          if (profile) {
            const avatarFromImage = profile.image ? buildImageUrl(profile.image) : undefined;
            profile.avatar = profile.avatar ?? avatarFromImage;
          }

          setUser(profile);
          setName(profile?.name ?? "");
          setEmail(profile?.email ?? "");
        }
      } catch {
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
      const res = await axiosInstance.put("/api/user/profile", { name, email });
      const data = res.data;
      if (!data || !data.success) {
        setMessage({ type: "error", text: data?.message || "Failed to update profile" });
      } else {
        setUser(data.data);
        try { document.cookie = `user=${encodeURIComponent(JSON.stringify(data.data))}; path=/`; } catch {}
        setMessage({ type: "success", text: "Profile updated" });
      }
    } catch {
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
                    <div className="relative h-28 w-28 rounded-full overflow-hidden">
                      <Image src={user.avatar} alt="avatar" fill className="object-cover" sizes="112px" />
                    </div>
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

                        const res = await axiosInstance.post("/api/users/avatar", fd, {
                          headers: { "Content-Type": "multipart/form-data" },
                        });

                        const data = res.data;
                        if (!data || !data.success) {
                          setMessage({ type: "error", text: data?.message || "Upload failed" });
                        } else {
                          // prefer backend provided full url, fallback to building from returned path
                          const avatarUrl = data.url ?? (data.path ? buildImageUrl(data.path) : null);

                          // build updated user object if provided by backend
                          let updatedUser: User | null = null;
                          if (data.user) {
                            updatedUser = { ...data.user, image: data.path ?? data.user.image, avatar: avatarUrl } as User;
                          } else {
                            updatedUser = (u => u ? { ...u, image: data.path ?? u.image, avatar: avatarUrl } : u)(user);
                          }

                          if (updatedUser) {
                            setUser(updatedUser);
                            try { document.cookie = `user=${encodeURIComponent(JSON.stringify(updatedUser))}; path=/`; } catch {}
                          }

                          setMessage({ type: "success", text: "Avatar uploaded" });
                        }

                        // release preview URL
                        URL.revokeObjectURL(preview);
                      } catch {
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
