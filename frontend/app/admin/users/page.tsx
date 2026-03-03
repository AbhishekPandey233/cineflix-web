"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/lib/api/axios";

type UserRow = {
  _id: string;
  name?: string;
  email?: string;
  image?: string;
  role?: "user" | "admin";
  createdAt?: string;
};

const buildImageUrl = (path?: string) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const baseFromEnv = process.env.NEXT_PUBLIC_API_BASE_URL ?? undefined;
  const baseFromAxios = axiosInstance.defaults.baseURL ?? undefined;
  const fallback = typeof window !== "undefined" ? `${window.location.protocol}//${window.location.hostname}:5000` : "";
  const base = baseFromEnv || baseFromAxios || fallback || "";
  if (!base) return path;
  const cleanedBase = base.replace(/\/$/, "");
  return `${cleanedBase}${path.startsWith("/") ? path : `/${path}`}`;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<UserRow | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const pageSize = 8;

  const fetchUsers = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/admin/users");
      setUsers(res.data?.data ?? []);
    } catch (err: unknown) {
      // @ts-expect-error - axios error shape
      const serverMsg = err?.response?.data?.message;
      setError(serverMsg || (err instanceof Error ? err.message : "Failed to load users"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user: UserRow) => {
    if (!user?._id) return;

    setDeletingId(user._id);
    setError("");
    try {
      await axiosInstance.delete(`/api/admin/users/${user._id}`);
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
    } catch (err: unknown) {
      // @ts-expect-error - axios error shape
      const serverMsg = err?.response?.data?.message;
      setError(serverMsg || (err instanceof Error ? err.message : "Failed to delete user"));
    } finally {
      setDeletingId(null);
    }
  };

  const openDeletePopup = (user: UserRow) => {
    if (!user?._id || deletingId) return;
    setConfirmDeleteUser(user);
  };

  const closeDeletePopup = () => {
    if (deletingId) return;
    setConfirmDeleteUser(null);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteUser) return;
    const userToDelete = confirmDeleteUser;
    setConfirmDeleteUser(null);
    await handleDelete(userToDelete);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const visibleUsers = useMemo(() => {
    const getCreatedAtTime = (user: UserRow) => {
      if (!user.createdAt) return NaN;
      const time = new Date(user.createdAt).getTime();
      return Number.isNaN(time) ? NaN : time;
    };

    return users
      .filter((u) => (u.role || "user").toLowerCase() !== "admin")
      .sort((a, b) => {
        const aTime = getCreatedAtTime(a);
        const bTime = getCreatedAtTime(b);

        if (!Number.isNaN(aTime) && !Number.isNaN(bTime) && aTime !== bTime) {
          return bTime - aTime;
        }
        if (!Number.isNaN(aTime) && Number.isNaN(bTime)) return -1;
        if (Number.isNaN(aTime) && !Number.isNaN(bTime)) return 1;

        return b._id.localeCompare(a._id);
      });
  }, [users]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return visibleUsers;

    return visibleUsers.filter((u) => {
      const name = (u.name ?? "").toLowerCase();
      const email = (u.email ?? "").toLowerCase();
      const id = (u._id ?? "").toLowerCase();
      return name.includes(query) || email.includes(query) || id.includes(query);
    });
  }, [visibleUsers, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
    if (page > totalPages) setPage(totalPages);
  }, [filteredUsers.length, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredUsers.length);
  const pageUsers = filteredUsers.slice(startIndex, endIndex);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Users</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Managing <span className="text-white font-semibold">{visibleUsers.length}</span> active accounts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user by name, email, or ID"
            className="w-72 max-w-full px-4 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none"
          />
          <button
            onClick={fetchUsers}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition active:scale-95"
          >
            Refresh
          </button>
          <Link
            href="/admin/users/create"
            className="px-4 py-2 text-sm font-bold rounded-lg bg-red-600 text-white hover:bg-red-700 transition active:scale-95"
          >
            + New User
          </Link>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && <p className="text-sm text-neutral-400 animate-pulse">Fetching records...</p>}
      {error && <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

      {!loading && !error && (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/10">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-neutral-500">Member</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-neutral-500">Status / Role</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-neutral-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-neutral-500 italic">No users found.</td>
                </tr>
              ) : (
                pageUsers.map((u) => (
                  <tr key={u._id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-white/5 grid place-items-center text-xs font-semibold text-white/70">
                          {u.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={buildImageUrl(u.image) ?? ""} alt={`${u.name || "User"} avatar`} className="h-full w-full object-cover" />
                          ) : (
                            (u.name?.[0] || "U").toUpperCase()
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-neutral-100 group-hover:text-white transition">
                            {u.name || "Unnamed User"}
                          </span>
                          <span className="text-xs text-neutral-400">{u.email}</span>
                          <span className="text-[10px] font-mono text-neutral-600 mt-1 uppercase tracking-tighter">ID: {u._id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                        u.role === 'admin' 
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' 
                        : 'bg-white/5 border-white/10 text-neutral-400'
                      }`}>
                        {u.role || "user"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/${u._id}`} 
                          className="px-3 py-1.5 text-xs font-medium rounded-md text-neutral-400 hover:text-white hover:bg-white/5 transition"
                        >
                          View
                        </Link>
                        <Link 
                          href={`/admin/${u._id}/edit`} 
                          className="px-3 py-1.5 text-xs font-bold rounded-md bg-red-600 text-white hover:bg-red-700 transition"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => openDeletePopup(u)}
                          disabled={deletingId === u._id}
                          className="px-3 py-1.5 text-xs font-bold rounded-md bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingId === u._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && filteredUsers.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mt-6 text-sm text-neutral-400">
          <div>
            Showing <span className="text-white">{startIndex + 1}</span> to <span className="text-white">{endIndex}</span> of{" "}
            <span className="text-white">{filteredUsers.length}</span> users
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const num = idx + 1;
                const isActive = num === page;
                return (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition ${isActive ? "bg-red-600 text-white border-red-500" : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"}`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {confirmDeleteUser ? (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-lg border border-blue-200 bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-blue-700">Delete user?</h2>
            <p className="mt-2 text-sm text-blue-600">
              Delete {confirmDeleteUser.name || "this user"}? This action cannot be undone.
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={closeDeletePopup}
                disabled={!!deletingId}
                className="rounded-md border border-blue-300 px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 transition disabled:opacity-60"
              >
                Go Back
              </button>
              <button
                onClick={confirmDelete}
                disabled={!!deletingId}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60"
              >
                {deletingId === confirmDeleteUser._id ? "Deleting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}