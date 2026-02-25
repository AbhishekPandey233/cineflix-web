"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";

type MovieRow = {
  _id: string;
  title: string;
  genre: string;
  rating: string;
  year: number;
  score: number;
  duration: string;
  status: "now-showing" | "coming-soon";
  releaseDate?: string;
};

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<MovieRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchMovies = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await axiosInstance.get(API.ADMIN.MOVIES.ALL);
      setMovies(res.data?.data ?? []);
    } catch (err: unknown) {
      // @ts-expect-error - axios error shape
      const serverMsg = err?.response?.data?.message;
      setError(serverMsg || (err instanceof Error ? err.message : "Failed to load movies"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (movie: MovieRow) => {
    if (!movie?._id) return;
    const ok = window.confirm(`Delete ${movie.title}? This cannot be undone.`);
    if (!ok) return;

    setDeletingId(movie._id);
    setError("");
    try {
      await axiosInstance.delete(API.ADMIN.MOVIES.DETAILS(movie._id));
      setMovies((prev) => prev.filter((m) => m._id !== movie._id));
    } catch (err: unknown) {
      // @ts-expect-error - axios error shape
      const serverMsg = err?.response?.data?.message;
      setError(serverMsg || (err instanceof Error ? err.message : "Failed to delete movie"));
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const { nowShowing, comingSoon } = useMemo(() => {
    const showing = movies.filter((m) => m.status === "now-showing");
    const coming = movies.filter((m) => m.status === "coming-soon");
    return { nowShowing: showing, comingSoon: coming };
  }, [movies]);

  const renderTable = (items: MovieRow[], emptyLabel: string) => {
    if (items.length === 0) {
      return <div className="px-6 py-8 text-sm text-neutral-500 italic">{emptyLabel}</div>;
    }

    return (
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white/[0.03] border-b border-white/10">
            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-neutral-500">Title</th>
            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-neutral-500">Genre</th>
            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-neutral-500">Score</th>
            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-neutral-500">Year</th>
            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-neutral-500 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {items.map((movie) => (
            <tr key={movie._id} className="group hover:bg-white/[0.02] transition-colors">
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="font-semibold text-neutral-100 group-hover:text-white transition">
                    {movie.title}
                  </span>
                  <span className="text-xs text-neutral-400">{movie.rating}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-neutral-300">{movie.genre}</td>
              <td className="px-6 py-4 text-sm text-neutral-300">{movie.score.toFixed(1)}</td>
              <td className="px-6 py-4 text-sm text-neutral-300">{movie.year}</td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/movies/${movie._id}`}
                    className="px-3 py-1.5 text-xs font-medium rounded-md text-neutral-400 hover:text-white hover:bg-white/5 transition"
                  >
                    View
                  </Link>
                  <Link
                    href={`/admin/movies/${movie._id}/edit`}
                    className="px-3 py-1.5 text-xs font-bold rounded-md bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(movie)}
                    disabled={deletingId === movie._id}
                    className="px-3 py-1.5 text-xs font-bold rounded-md bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === movie._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Movies</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Managing <span className="text-white font-semibold">{movies.length}</span> titles
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMovies}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition active:scale-95"
          >
            Refresh
          </button>
          <Link
            href="/admin/movies/create"
            className="px-4 py-2 text-sm font-bold rounded-lg bg-red-600 text-white hover:bg-red-700 transition active:scale-95"
          >
            + New Movie
          </Link>
        </div>
      </div>

      {loading && <p className="text-sm text-neutral-400 animate-pulse">Fetching records...</p>}
      {error && <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

      {!loading && !error && (
        <div className="space-y-8">
          <section className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Now Showing</h2>
                <p className="text-xs text-neutral-400">{nowShowing.length} titles</p>
              </div>
              <Link href="/movies" className="text-xs text-neutral-400 hover:text-white">
                View on site
              </Link>
            </div>
            {renderTable(nowShowing, "No movies are currently showing.")}
          </section>

          <section className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Coming Soon</h2>
                <p className="text-xs text-neutral-400">{comingSoon.length} titles</p>
              </div>
              <span className="text-xs text-neutral-500">Release dates managed in movie details</span>
            </div>
            {renderTable(comingSoon, "No upcoming movies yet.")}
          </section>
        </div>
      )}
    </div>
  );
}
