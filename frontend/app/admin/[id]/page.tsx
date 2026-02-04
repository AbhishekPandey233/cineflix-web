"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/api/axios";

type User = {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
};

export default function AdminUserByIdPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    axiosInstance.get(`/api/admin/users/${id}`)
      .then((res) => setUser(res.data?.data || res.data))
      .catch((err) => setError(err?.response?.data?.message || err?.message || "Request failed"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this user?")) return;

    setDeleting(true);
    try {
      const res = await axiosInstance.delete(`/api/admin/users/${id}`);
      const json = res.data;
      if (res.status >= 200 && res.status < 300) {
        alert(json?.message || "User deleted");
        router.push("/admin/users");
      } else {
        alert(json?.message || "Delete failed");
      }
    } catch (err: unknown) {
      let msg = "Delete failed";
      if (err instanceof Error) {
        msg = err.message;
      } else if (typeof err === "object" && err !== null) {
        // axios error shape: err.response.data.message or err.message
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        msg = (err as any)?.response?.data?.message ?? (err as any)?.message ?? msg;
      }
      alert(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">View user</h1>
          <p className="text-sm text-neutral-400 mt-1">User details and quick actions</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/users"
            className="text-sm text-neutral-300 px-3 py-1 rounded-md hover:bg-white/3 transition"
          >
            ← Back
          </Link>

          {id && (
            <Link
              href={`/admin/${id}/edit`}
              className="text-sm px-3 py-1 rounded-md bg-foreground text-background hover:opacity-90 transition"
            >
              Edit
            </Link>
          )}

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm px-3 py-1 rounded-md border border-red-600 text-red-500 hover:bg-red-600/10 transition disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="mt-4 text-sm text-neutral-400">Loading user...</div>
      ) : null}

      {error ? (
        <div className="mt-4 text-sm text-red-500">{error}</div>
      ) : null}

      {!loading && !error ? (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white/3 rounded-lg p-5">
            <div className="mb-3 text-sm text-neutral-400">Profile</div>

            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-start gap-4">
                <div className="w-28 text-xs text-neutral-400">ID</div>
                <div className="text-sm text-neutral-100 break-words">{user?._id ?? id ?? "—"}</div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-28 text-xs text-neutral-400">Name</div>
                <div className="text-sm text-neutral-100">{user?.name ?? "—"}</div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-28 text-xs text-neutral-400">Email</div>
                <div className="text-sm text-neutral-100">{user?.email ?? "—"}</div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-28 text-xs text-neutral-400">Role</div>
                <div className="text-sm text-neutral-100">{user?.role ?? "—"}</div>
              </div>
            </div>
          </div>

          <aside className="bg-white/3 rounded-lg p-5">
            <div className="text-sm text-neutral-400 mb-4">Actions</div>

            <div className="flex flex-col gap-2">
              <Link
                href={`/admin/users`}
                className="text-sm px-3 py-2 rounded-md border bg-transparent hover:bg-white/5 transition text-neutral-200 text-left"
              >
                View all users
              </Link>

              <Link
                href={`/admin/${id}/edit`}
                className="text-sm px-3 py-2 rounded-md bg-foreground text-background hover:opacity-90 transition text-left"
              >
                Edit user
              </Link>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-sm px-3 py-2 rounded-md border border-red-600 text-red-500 hover:bg-red-600/10 transition text-left disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete user"}
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
