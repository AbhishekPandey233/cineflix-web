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

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Users</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Managing <span className="text-white font-semibold">{users.length}</span> active accounts
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
              {users.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-neutral-500 italic">No users found.</td>
                </tr>
              ) : (
                users.map((u) => (
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
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}