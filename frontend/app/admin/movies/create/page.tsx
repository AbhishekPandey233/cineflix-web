"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";

export default function AdminCreateMoviePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [rating, setRating] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [score, setScore] = useState<number>(8);
  const [duration, setDuration] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [language, setLanguage] = useState("");
  const [status, setStatus] = useState<"now-showing" | "coming-soon">("now-showing");
  const [releaseDate, setReleaseDate] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (!image) {
        setError("Poster image is required");
        setSaving(false);
        return;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("genre", genre);
      formData.append("rating", rating);
      formData.append("year", String(year));
      formData.append("score", String(score));
      formData.append("duration", duration);
      formData.append("synopsis", synopsis);
      formData.append("language", language);
      formData.append("status", status);
      if (releaseDate) formData.append("releaseDate", releaseDate);
      formData.append("image", image);

      const res = await axiosInstance.post(API.ADMIN.MOVIES.ALL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const createdId = res.data?.data?._id;
      if (createdId) {
        router.push(`/admin/movies/${createdId}`);
      } else {
        router.push("/admin/movies");
      }
    } catch (err: unknown) {
      // @ts-expect-error - axios error shape
      const serverMsg = err?.response?.data?.message;
      setError(serverMsg || (err instanceof Error ? err.message : "Failed to create movie"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Create Movie</h1>
        <p className="text-sm text-neutral-400 mt-1">Add a new title to the catalog</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-2 text-sm">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            Genre
            <input
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            Rating
            <input
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2"
              placeholder="PG-13"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            Poster Image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            Year
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            Score
            <input
              type="number"
              min={0}
              max={10}
              step={0.1}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            Duration
            <input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2"
              placeholder="2h 15m"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            Language
            <input
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            Status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "now-showing" | "coming-soon")}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2"
            >
              <option value="now-showing">Now Showing</option>
              <option value="coming-soon">Coming Soon</option>
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm">
            Release Date
            <input
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2"
            />
          </label>
        </div>

        <label className="flex flex-col gap-2 text-sm">
          Synopsis
          <textarea
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            rows={5}
            className="rounded-md border border-white/10 bg-white/5 px-3 py-2"
            required
          />
        </label>

        {error && <div className="text-sm text-red-400">{error}</div>}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/movies")}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-bold rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-70"
          >
            {saving ? "Saving..." : "Create Movie"}
          </button>
        </div>
      </form>
    </div>
  );
}
