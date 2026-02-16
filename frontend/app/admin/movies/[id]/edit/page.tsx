"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";

type MovieDTO = {
  _id: string;
  title: string;
  genre: string;
  rating: string;
  img: string;
  year: number;
  score: number;
  duration: string;
  synopsis: string;
  language: string;
  status: "now-showing" | "coming-soon";
  releaseDate?: string;
};

type ShowtimeDTO = {
  _id: string;
  movieId: string;
  hallId: "A" | "B";
  hallName: "Hall A" | "Hall B";
  startTime: string;
  price: number;
};

const toDateInput = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const toDateTimeLocal = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

export default function AdminMovieEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [movie, setMovie] = useState<MovieDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [rating, setRating] = useState("");
  const [img, setImg] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [score, setScore] = useState<number>(8);
  const [duration, setDuration] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [language, setLanguage] = useState("");
  const [status, setStatus] = useState<"now-showing" | "coming-soon">("now-showing");
  const [releaseDate, setReleaseDate] = useState("");

  // Showtime states
  const [showtimes, setShowtimes] = useState<ShowtimeDTO[]>([]);
  const [showtimeId, setShowtimeId] = useState<string | null>(null);
  const [hallId, setHallId] = useState<"A" | "B">("A");
  const [startTime, setStartTime] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [savingShowtime, setSavingShowtime] = useState(false);
  const [showtimeError, setShowtimeError] = useState<string>("");

  const hasChanges = useMemo(() => {
    if (!movie) return false;
    return (
      title !== (movie.title ?? "") ||
      genre !== (movie.genre ?? "") ||
      rating !== (movie.rating ?? "") ||
      img !== (movie.img ?? "") ||
      !!image ||
      year !== movie.year ||
      score !== movie.score ||
      duration !== (movie.duration ?? "") ||
      synopsis !== (movie.synopsis ?? "") ||
      language !== (movie.language ?? "") ||
      status !== (movie.status ?? "now-showing") ||
      releaseDate !== toDateInput(movie.releaseDate)
    );
  }, [movie, title, genre, rating, img, image, year, score, duration, synopsis, language, status, releaseDate]);

  const showtimeHeading = useMemo(() => (showtimeId ? "Edit Showtime" : "Add Showtime"), [showtimeId]);

  const fetchMovie = async (movieId: string) => {
    setError("");
    setLoading(true);
    try {
      const res = await axiosInstance.get(API.ADMIN.MOVIES.DETAILS(movieId));
      const data = res.data?.data as MovieDTO | undefined;
      if (!data) throw new Error("Movie not found");

      setMovie(data);
      setTitle(data.title ?? "");
      setGenre(data.genre ?? "");
      setRating(data.rating ?? "");
      setImg(data.img ?? "");
      setImage(null);
      setYear(data.year ?? new Date().getFullYear());
      setScore(data.score ?? 8);
      setDuration(data.duration ?? "");
      setSynopsis(data.synopsis ?? "");
      setLanguage(data.language ?? "");
      setStatus(data.status ?? "now-showing");
      setReleaseDate(toDateInput(data.releaseDate));
    } catch (err: unknown) {
      // @ts-expect-error - axios error shape
      const serverMsg = err?.response?.data?.message;
      setError(serverMsg || (err instanceof Error ? err.message : "Failed to load movie"));
    } finally {
      setLoading(false);
    }
  };

  const fetchShowtimes = async (movieId: string) => {
    try {
      const res = await axiosInstance.get(API.ADMIN.SHOWTIMES.BY_MOVIE(movieId));
      setShowtimes(res.data?.data ?? []);
    } catch (err: unknown) {
      console.error("Failed to load showtimes:", err);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchMovie(id);
    fetchShowtimes(id);
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setError("");
    setSaving(true);

    try {
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
      if (releaseDate) {
        formData.append("releaseDate", releaseDate);
      } else {
        formData.append("releaseDate", "");
      }
      if (image) formData.append("image", image);

      const res = await axiosInstance.put(API.ADMIN.MOVIES.DETAILS(id), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updated = res.data?.data as MovieDTO | undefined;
      if (updated) {
        setMovie(updated);
        setImg(updated.img ?? "");
        setImage(null);
      }

      router.push(`/admin/movies/${id}`);
    } catch (err: unknown) {
      // @ts-expect-error - axios error shape
      const serverMsg = err?.response?.data?.message;
      setError(serverMsg || (err instanceof Error ? err.message : "Failed to update movie"));
    } finally {
      setSaving(false);
    }
  };

  const resetShowtimeForm = () => {
    setShowtimeId(null);
    setHallId("A");
    setStartTime("");
    setPrice(0);
  };

  const handleShowtimeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setShowtimeError("");
    setSavingShowtime(true);

    try {
      const payload = {
        movieId: id,
        hallId,
        startTime,
        price,
      };

      if (showtimeId) {
        const res = await axiosInstance.put(API.ADMIN.SHOWTIMES.DETAILS(showtimeId), payload);
        const updated = res.data?.data as ShowtimeDTO | undefined;
        if (updated) {
          setShowtimes((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
        }
      } else {
        const res = await axiosInstance.post(API.ADMIN.SHOWTIMES.CREATE, payload);
        const created = res.data?.data as ShowtimeDTO | undefined;
        if (created) {
          setShowtimes((prev) => [...prev, created].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()));
        }
      }

      resetShowtimeForm();
    } catch (err: unknown) {
      // @ts-expect-error - axios error shape
      const serverMsg = err?.response?.data?.message;
      setShowtimeError(serverMsg || (err instanceof Error ? err.message : "Failed to save showtime"));
    } finally {
      setSavingShowtime(false);
    }
  };

  const handleShowtimeEdit = (showtime: ShowtimeDTO) => {
    setShowtimeId(showtime._id);
    setHallId(showtime.hallId);
    setStartTime(toDateTimeLocal(showtime.startTime));
    setPrice(showtime.price ?? 0);
  };

  const handleShowtimeDelete = async (showtime: ShowtimeDTO) => {
    const ok = window.confirm("Delete this showtime?");
    if (!ok) return;

    try {
      await axiosInstance.delete(API.ADMIN.SHOWTIMES.DETAILS(showtime._id));
      setShowtimes((prev) => prev.filter((s) => s._id !== showtime._id));
      if (showtimeId === showtime._id) resetShowtimeForm();
    } catch (err: unknown) {
      // @ts-expect-error - axios error shape
      const serverMsg = err?.response?.data?.message;
      setShowtimeError(serverMsg || (err instanceof Error ? err.message : "Failed to delete showtime"));
    }
  };

  if (!id) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Edit movie</h1>
        <p className="text-sm text-neutral-400 mt-2">Loading route params...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Edit movie</h1>
        <p className="text-sm text-neutral-400 mt-2">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Edit movie</h1>
        <p className="text-sm text-neutral-400 mt-2">ID: {id}</p>
        <p className="text-sm text-red-400 mt-2">{error}</p>
        <button
          onClick={() => fetchMovie(id)}
          className="mt-4 px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Edit movie</h1>
        <p className="text-sm text-neutral-400 mt-2">Movie not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit Movie</h1>
        <p className="text-sm text-neutral-400 mt-1">ID: {id}</p>
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
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            Current Poster
            <input
              value={img}
              readOnly
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-neutral-400"
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
          Replace Poster (optional)
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            className="rounded-md border border-white/10 bg-white/5 px-3 py-2"
          />
        </label>

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
            onClick={() => router.push(`/admin/movies/${id}`)}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !hasChanges}
            className="px-4 py-2 text-sm font-bold rounded-lg bg-white text-black hover:bg-neutral-200 transition disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {status === "now-showing" && (
        <section className="rounded-xl border border-white/10 bg-black/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Showtimes for Booking</h2>
            <span className="text-xs text-neutral-400">{showtimes.length} scheduled</span>
          </div>

          <form onSubmit={handleShowtimeSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <label className="flex flex-col gap-2 text-sm">
              Hall
              <select
                value={hallId}
                onChange={(e) => setHallId(e.target.value as "A" | "B")}
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2"
              >
                <option value="A">Hall A</option>
                <option value="B">Hall B</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm">
              Start Time
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2"
                required
              />
            </label>

            <label className="flex flex-col gap-2 text-sm">
              Price
              <input
                type="number"
                min={0}
                step={0.01}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2"
                required
              />
            </label>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={savingShowtime}
                className="w-full px-4 py-2 text-sm font-bold rounded-lg bg-white text-black hover:bg-neutral-200 transition disabled:opacity-70"
              >
                {savingShowtime ? "Saving..." : showtimeHeading}
              </button>
              {showtimeId ? (
                <button
                  type="button"
                  onClick={resetShowtimeForm}
                  className="px-4 py-2 text-sm rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>

          {showtimeError && <div className="text-sm text-red-400 mb-4">{showtimeError}</div>}

          <div className="overflow-hidden rounded-lg border border-white/10">
            {showtimes.length === 0 ? (
              <div className="px-4 py-8 text-sm text-neutral-500 italic">No showtimes scheduled yet.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.03] border-b border-white/10">
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-neutral-500">Hall</th>
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-neutral-500">Start</th>
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-neutral-500">Price</th>
                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-neutral-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {showtimes.map((showtime) => (
                    <tr key={showtime._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-sm text-neutral-200">{showtime.hallName}</td>
                      <td className="px-4 py-3 text-sm text-neutral-200">
                        {new Date(showtime.startTime).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-200">${showtime.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleShowtimeEdit(showtime)}
                            className="px-3 py-1.5 text-xs font-medium rounded-md text-neutral-400 hover:text-white hover:bg-white/5 transition"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleShowtimeDelete(showtime)}
                            className="px-3 py-1.5 text-xs font-bold rounded-md bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
