"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axiosInstance from "@/lib/api/axios";

type UserDTO = {
  _id: string;
  name?: string;
  email?: string;
  role?: "user" | "admin";
  image?: string;
  createdAt?: string;
};

export default function AdminUserEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  const [user, setUser] = useState<UserDTO | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const hasChanges = useMemo(() => {
    if (!user) return false;
    return (
      name !== (user.name ?? "") ||
      email !== (user.email ?? "") ||
      role !== (user.role ?? "user") ||
      password.length > 0 ||
      !!image
    );
  }, [user, name, email, role, password, image]);

  const fetchUser = async (userId: string) => {
    setError("");
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/api/admin/users/${userId}`);
      const u: UserDTO | undefined = res.data?.data;
      if (!u) throw new Error("User not found");

      setUser(u);
      setName(u.name ?? "");
      setEmail(u.email ?? "");
      setRole((u.role as "user" | "admin") ?? "user");
      setPassword("");
      setImage(null);
    } catch (err: unknown) {
      let msg = "Failed to load user";
      if (err instanceof Error) msg = err.message;
      else if (typeof err === "object" && err !== null) {
        // axios error shape: err.response.data.message
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        msg = (err as any)?.response?.data?.message ?? (err as any)?.message ?? msg;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return; // wait until params are available
    fetchUser(id);
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    setError("");
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("role", role);
      if (password.trim()) formData.append("password", password.trim());
      if (image) formData.append("image", image);

      const res = await axiosInstance.put(`/api/admin/users/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updated = res.data?.data as UserDTO | undefined;
      if (updated) {
        setUser(updated);
        setName(updated.name ?? "");
        setEmail(updated.email ?? "");
        setRole((updated.role as "user" | "admin") ?? "user");
        setPassword("");
        setImage(null);
      } else {
        await fetchUser(id);
      }

      router.push(`/admin/${id}`);
      router.refresh();
    } catch (err: unknown) {
      let msg = "Failed to update user";
      if (err instanceof Error) msg = err.message;
      else if (typeof err === "object" && err !== null) {
        // axios error shape: err.response.data.message
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        msg = (err as any)?.response?.data?.message ?? (err as any)?.message ?? msg;
      }
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!id) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
        <p className="mt-2 text-sm text-neutral-400">Loading route params...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
        <p className="mt-2 text-sm text-neutral-400">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
        <p className="mt-2 text-sm text-neutral-400">ID: {id}</p>
        <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{error}</p>
        <button
          onClick={() => fetchUser(id)}
          className="mt-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
        <p className="mt-2 text-sm text-neutral-400">User not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
        <p className="mt-1 text-sm text-neutral-400">ID: {id}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            Role
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "user" | "admin")}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white"
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm">
            New Password (optional)
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="leave blank to keep current"
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm md:col-span-2">
            Replace Image (optional)
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2"
            />
          </label>

          <div className="flex gap-3 md:col-span-2">
            <button
              type="button"
              onClick={() => router.push(`/admin/${id}`)}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || !hasChanges}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {error ? (
            <div className="md:col-span-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
          ) : null}
        </div>
      </form>
    </div>
  );
}
