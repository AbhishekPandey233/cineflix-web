"use client";

import Link from "next/link";
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

const toDateTimeLocal = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

export default function AdminMovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [movie, setMovie] = useState<MovieDTO | null>(null);
  const [showtimes, setShowtimes] = useState<ShowtimeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [deleting, setDeleting] = useState(false);

  const [showtimeId, setShowtimeId] = useState<string | null>(null);
  const [hallId, setHallId] = useState<"A" | "B">("A");
  const [startTime, setStartTime] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [savingShowtime, setSavingShowtime] = useState(false);
  const [showtimeError, setShowtimeError] = useState<string>("");

  const fetchMovie = async (movieId: string) => {
    setError("");
    setLoading(true);
    try {
      const res = await axiosInstance.get(API.ADMIN.MOVIES.DETAILS(movieId));
      setMovie(res.data?.data ?? null);
    } catch (err: unknown) {
      // @ts-expect-error - axios error shape
      const serverMsg = err?.response?.data?.message;
      setError(serverMsg || (err instanceof Error ? err.message : "Failed to load movie"));
    } finally {
      setLoading(false);
    }
  };

  const fetchShowtimes = async (movieId: string) => {
    setShowtimeError("");
    try {
      const res = await axiosInstance.get(API.ADMIN.SHOWTIMES.BY_MOVIE(movieId));
      setShowtimes(res.data?.data ?? []);
    } catch (err: unknown) {
      // @ts-expect-error - axios error shape
      const serverMsg = err?.response?.data?.message;
      setShowtimeError(serverMsg || (err instanceof Error ? err.message : "Failed to load showtimes"));
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchMovie(id);
    fetchShowtimes(id);
  }, [id]);

  const resetShowtimeForm = () => {
    setShowtimeId(null);
    setHallId("A");
    setStartTime("");
    setPrice(0);
  };

  const handleDeleteMovie = async () => {
    if (!id) return;
    const ok = window.confirm("Delete this movie and its showtimes? This cannot be undone.");
    if (!ok) return;

    setDeleting(true);
    try {
      await axiosInstance.delete(API.ADMIN.MOVIES.DETAILS(id));
      router.push("/admin/movies");
    } catch (err: unknown) {
      // @ts-expect-error - axios error shape
      const serverMsg = err?.response?.data?.message;
      setError(serverMsg || (err instanceof Error ? err.message : "Failed to delete movie"));
    } finally {
      setDeleting(false);
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

  const showtimeHeading = useMemo(() => (showtimeId ? "Edit Showtime" : "Add Showtime"), [showtimeId]);

  if (!id) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Movie details</h1>
        <p className="text-sm text-neutral-400 mt-2">Loading route params...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Movie details</h1>
        <p className="text-sm text-neutral-400 mt-2">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Movie details</h1>
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
        <h1 className="text-2xl font-semibold">Movie details</h1>
        <p className="text-sm text-neutral-400 mt-2">Movie not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{movie.title}</h1>
          <p className="text-sm text-neutral-400 mt-1">ID: {movie._id}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/movies"
            className="px-3 py-2 text-sm rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition"
          >
            Back to movies
          </Link>
          <Link
            href={`/admin/movies/${movie._id}/edit`}
            className="px-3 py-2 text-sm font-bold rounded-md bg-white text-black hover:bg-neutral-200 transition"
          >
            Edit movie
          </Link>
          <button
            onClick={handleDeleteMovie}
            disabled={deleting}
            className="px-3 py-2 text-sm font-bold rounded-md bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 transition disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-xl border border-white/10 bg-black/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Overview</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${movie.status === "now-showing" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
              {movie.status.replace("-", " ")}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-neutral-200">
            <div>
              <div className="text-xs text-neutral-400">Genre</div>
              <div className="mt-1 font-semibold">{movie.genre}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-400">Rating</div>
              <div className="mt-1 font-semibold">{movie.rating}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-400">Year</div>
              <div className="mt-1 font-semibold">{movie.year}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-400">Score</div>
              <div className="mt-1 font-semibold">{movie.score.toFixed(1)}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-400">Duration</div>
              <div className="mt-1 font-semibold">{movie.duration}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-400">Language</div>
              <div className="mt-1 font-semibold">{movie.language}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-400">Release Date</div>
              <div className="mt-1 font-semibold">
                {movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString() : "TBA"}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-xs text-neutral-400">Synopsis</div>
            <p className="mt-2 text-sm text-neutral-200 leading-relaxed">{movie.synopsis}</p>
          </div>
        </div>

        <aside className="rounded-xl border border-white/10 bg-black/30 p-6 space-y-4">
          <div>
            <div className="text-xs text-neutral-400">Poster URL</div>
            <div className="mt-2 text-sm text-neutral-200 break-all">{movie.img}</div>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href={`/movies/${movie._id}`}
              className="px-3 py-2 text-sm rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition text-center"
            >
              View on site
            </Link>
            <button
              onClick={() => {
                fetchMovie(id);
                fetchShowtimes(id);
              }}
              className="px-3 py-2 text-sm rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition"
            >
              Refresh data
            </button>
          </div>
        </aside>
      </div>

      <section className="rounded-xl border border-white/10 bg-black/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Showtimes</h2>
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
                          onClick={() => handleShowtimeEdit(showtime)}
                          className="px-3 py-1.5 text-xs font-medium rounded-md text-neutral-400 hover:text-white hover:bg-white/5 transition"
                        >
                          Edit
                        </button>
                        <button
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
    </div>
  );
}
