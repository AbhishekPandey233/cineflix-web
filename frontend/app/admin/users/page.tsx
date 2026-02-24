"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/api/axios";

type UserRow = {
  _id: string;
  name?: string;
  email?: string;
  role?: "user" | "admin";
  createdAt?: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
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
    const ok = window.confirm(`Delete ${user.name || "this user"}? This cannot be undone.`);
    if (!ok) return;

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const visibleUsers = users.filter((u) => (u.role || "user").toLowerCase() !== "admin");

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(visibleUsers.length / pageSize));
    if (page > totalPages) setPage(totalPages);
  }, [visibleUsers.length, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(visibleUsers.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, visibleUsers.length);
  const pageUsers = visibleUsers.slice(startIndex, endIndex);

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
          <button
            onClick={fetchUsers}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition active:scale-95"
          >
            Refresh
          </button>
          <Link
            href="/admin/users/create"
            className="px-4 py-2 text-sm font-bold rounded-lg bg-white text-black hover:bg-neutral-200 transition active:scale-95 shadow-lg shadow-white/5"
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
              {visibleUsers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-neutral-500 italic">No users found.</td>
                </tr>
              ) : (
                pageUsers.map((u) => (
                  <tr key={u._id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-neutral-100 group-hover:text-white transition">
                          {u.name || "Unnamed User"}
                        </span>
                        <span className="text-xs text-neutral-400">{u.email}</span>
                        <span className="text-[10px] font-mono text-neutral-600 mt-1 uppercase tracking-tighter">ID: {u._id}</span>
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
                          className="px-3 py-1.5 text-xs font-bold rounded-md bg-white text-black hover:bg-neutral-200 transition"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(u)}
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

      {!loading && !error && visibleUsers.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mt-6 text-sm text-neutral-400">
          <div>
            Showing <span className="text-white">{startIndex + 1}</span> to <span className="text-white">{endIndex}</span> of{" "}
            <span className="text-white">{visibleUsers.length}</span> users
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
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition ${isActive ? "bg-white text-black border-white" : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"}`}
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
    </div>
  );
}