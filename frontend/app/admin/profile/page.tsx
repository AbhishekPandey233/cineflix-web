"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";

type AdminProfile = {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt?: string;
};

export default function AdminProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      setLoading(true);
      setMessage(null);
      try {
        const res = await axiosInstance.get(API.USER.PROFILE);
        const data = res.data?.data ?? null;
        if (!mounted) return;
        setProfile(data);
        setName(data?.name ?? "");
        setEmail(data?.email ?? "");
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        const errorMessage =
          axiosErr?.response?.data?.message ||
          (err instanceof Error ? err.message : "Failed to load profile");
        if (mounted) setMessage({ type: "error", text: errorMessage });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const normalizedName = name.trim();
    const normalizedEmail = email.trim();

    if (!normalizedName || !normalizedEmail) {
      setMessage({ type: "error", text: "Name and email are required" });
      return;
    }

    const hasChanges = normalizedName !== profile.name || normalizedEmail !== profile.email;
    if (!hasChanges) {
      setMessage({ type: "error", text: "Nothing to update" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await axiosInstance.put(API.USER.PROFILE, {
        name: normalizedName,
        email: normalizedEmail,
      });

      const updated = res.data?.data;
      const merged = {
        ...profile,
        ...(updated ?? {}),
      } as AdminProfile;

      setProfile(merged);
      setName(merged.name ?? "");
      setEmail(merged.email ?? "");

      try {
        document.cookie = `user=${encodeURIComponent(JSON.stringify(merged))}; path=/`;
      } catch {}

      setMessage({ type: "success", text: "Profile updated" });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const errorMessage =
        axiosErr?.response?.data?.message ||
        (err instanceof Error ? err.message : "Failed to update profile");
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!profile?._id) return;

    const confirmed = window.confirm("Delete your admin account? This action cannot be undone.");
    if (!confirmed) return;

    setDeleting(true);
    setMessage(null);

    try {
      await axiosInstance.delete(API.ADMIN.USERS.DELETE(profile._id));

      try {
        await axiosInstance.post(API.AUTH.LOGOUT);
      } catch {}

      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      router.replace("/login");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const errorMessage =
        axiosErr?.response?.data?.message ||
        (err instanceof Error ? err.message : "Failed to delete profile");
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight">Admin Profile</h1>
        <p className="text-sm text-neutral-400 mt-2">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Profile</h1>
        <p className="text-sm text-neutral-400 mt-1">View, edit, and manage your admin account.</p>
      </div>

      {message && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            message.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {profile ? (
        <div className="rounded-xl border border-white/10 bg-black/20 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-white/50">Role</p>
              <p className="text-sm font-semibold mt-1">{profile.role}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-white/50">Account ID</p>
              <p className="text-xs font-mono mt-1 text-white/70">{profile._id}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-white/80">Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-red-500/60"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-white/80">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-red-500/60"
              />
            </label>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-bold rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-bold rounded-lg bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
          Could not load admin profile.
        </div>
      )}
    </div>
  );
}
