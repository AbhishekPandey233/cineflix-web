"use client";

import { useState } from "react";
import axiosInstance from "@/lib/api/axios";

export default function AdminCreateUserPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [image, setImage] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      // ✅ Use FormData even if no image
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", role);
      if (image) formData.append("image", image);

      // ✅ IMPORTANT: send token in Authorization header
      // token is stored as httpOnly cookie, so client JS can't read it.
      // So for now: simplest is to also store a non-httpOnly token cookie OR store token in localStorage.
      // If you haven't done that, create a Next API route proxy (I'll give you if needed).

      const res = await axiosInstance.post("/api/admin/users", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(res.data?.message || "User created");
      setName("");
      setEmail("");
      setPassword("");
      setRole("user");
      setImage(null);
    } catch (err: unknown) {
      let msg = "Something went wrong";
      if (err instanceof Error) msg = err.message;
      else if (typeof err === "object" && err !== null && "response" in err) {
        // axios error shape: err.response.data.message
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        msg = (err as any)?.response?.data?.message ?? msg;
      }
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Create User</h1>
        <p className="mt-1 text-sm text-neutral-400">Add a new account from admin panel</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="john"
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@test.com"
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            Password
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="password123"
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40"
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

          <label className="flex flex-col gap-2 text-sm md:col-span-2">
            Image (optional)
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2"
            />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </div>

        {message ? (
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white/80">{message}</div>
        ) : null}
      </form>
    </div>
  );
}
