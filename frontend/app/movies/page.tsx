"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";

type Movie = {
  _id: string;
  title: string;
  genre: string;
  rating: string;
  img: string;
  year: number;
  releaseDate?: string;
  score: number;
  duration: string;
  synopsis: string;
  language: string;
  status: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.BACKEND_URL || "http://localhost:5000";

const resolveImageUrl = (path: string): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  // If it's a backend upload path, prefix with API base URL
  if (path.includes("/uploads/")) {
    return `${API_BASE_URL}${path}`;
  }
  // Otherwise it's a static public file, return as-is
  return path;
};

function RatingStars({ score }: { score: number }) {
  const full = Math.floor(score);
  const stars = Array.from({ length: 5 }).map((_, i) => i < full);
  return (
    <div className="flex items-center gap-1 text-sm" aria-label={`Rating ${score}`}>
      {stars.map((on, i) => (
        <span key={i} className={on ? "text-yellow-400" : "text-white/20"}>
          ★
        </span>
      ))}
      <span className="ml-2 text-white/60">{score.toFixed(1)}</span>
    </div>
  );
}

export default function MoviesPage() {
  const [nowShowing, setNowShowing] = useState<Movie[]>([]);
  const [comingSoon, setComingSoon] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const [showing, coming] = await Promise.all([
          axiosInstance.get(API.MOVIES.NOW_SHOWING),
          axiosInstance.get(API.MOVIES.COMING_SOON),
        ]);
        setNowShowing(showing.data.data || []);
        setComingSoon(coming.data.data || []);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen w-full bg-black text-white pt-14 flex items-center justify-center">
        <div>Loading...</div>
      </main>
    );
  }
  return (
    <main className="min-h-screen w-full bg-black text-white pt-14">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,0,0,0.15),transparent_45%)]" />
        <div className="mx-auto max-w-6xl px-6 py-14 md:px-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                <span className="h-[2px] w-6 bg-red-600" />
                Now Showing & Coming Soon
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
                Movies
                <span className="text-red-500">.</span>
              </h1>
              <p className="mt-3 max-w-2xl text-white/70">
                Discover what’s playing now and what’s next. Book your seats instantly with CineFlix.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Now Showing */}
      <section id="now-showing" className="mx-auto max-w-6xl px-6 pb-8 pt-6 md:px-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-red-500">Now Showing</h2>
          <Link href="/" className="text-sm text-white/60 hover:text-red-500">
            Back to home
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {nowShowing.map((movie) => (
            <Link
              key={movie._id}
              href={`/movies/${movie._id}`}
              className="group relative overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 transition hover:-translate-y-1 hover:ring-white/20"
            >
              <div className="relative h-[420px] w-full">
                <Image src={resolveImageUrl(movie.img)} alt={movie.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
                <div className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-1 text-xs font-semibold text-white backdrop-blur-md">
                  {movie.rating}
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="rounded-lg bg-sky-600/80 px-6 py-3 text-sm font-bold text-white backdrop-blur-md shadow-lg transition
                               opacity-0 group-hover:opacity-100 group-hover:scale-105"
                  >
                    View Details
                  </span>
                </div>
              </div>

              <div className="rounded-t-2xl bg-neutral-900/90 px-4 py-4 backdrop-blur-md">
                <h3 className="text-lg font-bold text-white leading-6">{movie.title}</h3>
                <p className="mt-1 text-sm text-white/70">{movie.genre}</p>

                <div className="mt-3 flex items-center justify-between">
                  <RatingStars score={movie.score} />
                  <span className="text-sm text-white/60">{movie.year}</span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-white/60">
                  <span>{movie.duration}</span>
                  <span>IMAX • Dolby</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Coming Soon */}
      <section className="mx-auto max-w-6xl px-6 pb-16 md:px-12">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Coming Soon</h3>
            <button className="text-xs text-white/60 hover:text-red-500">Get alerts</button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {comingSoon.map((movie) => (
              <div key={movie._id} className="rounded-xl bg-black/40 p-4 ring-1 ring-white/10">
                <div className="text-white font-semibold">{movie.title}</div>
                <div className="mt-2 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                  {movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString() : "TBA"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
