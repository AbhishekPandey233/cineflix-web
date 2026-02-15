"use client";

import React, { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import axiosInstance from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";

type Movie = {
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
};

type Showtime = {
  _id: string;
  movieId: string;
  hallId: string;
  hallName: string;
  startTime: string;
  price: number;
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

export default function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await axiosInstance.get(API.MOVIES.DETAILS(id));
        setMovie(response.data.data);
        
        // Fetch showtimes for this movie
        const showtimesResponse = await axiosInstance.get(API.SHOWTIMES.BY_MOVIE(id));
        setShowtimes(showtimesResponse.data.data || []);
      } catch (error) {
        console.error("Error fetching movie:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  if (!movie) {
    return (
      <main className="min-h-screen w-full bg-black text-white pt-14">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h1 className="text-3xl font-bold">{loading ? "Loading..." : "Movie not found"}</h1>
          <p className="mt-3 text-white/70">The movie you’re looking for isn’t available.</p>
          <Link href="/movies" className="mt-6 inline-flex rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
            Back to Movies
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-black text-white pt-14">
      <section className="mx-auto max-w-6xl px-6 py-10 md:px-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
            <div className="relative h-[520px] w-full">
              <Image src={movie.img} alt={movie.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
              <div className="absolute left-4 top-4 rounded-md bg-black/60 px-2 py-1 text-xs font-semibold text-white backdrop-blur-md">
                {movie.rating}
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                {movie.year}
              </span>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                {movie.duration}
              </span>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                {movie.language}
              </span>
            </div>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight">{movie.title}</h1>
            <p className="mt-2 text-white/70">{movie.genre}</p>

            <div className="mt-4">
              <RatingStars score={movie.score} />
            </div>

            <p className="mt-6 text-white/70 leading-relaxed">{movie.synopsis}</p>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-semibold text-white/80">Showtimes</div>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {showtimes.length > 0 ? (
                  showtimes.map((showtime) => (
                    <Link
                      key={showtime._id}
                      href={`/seat-select?showtimeId=${showtime._id}`}
                      className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white/80 hover:bg-white/10 text-center transition"
                    >
                      {new Date(showtime.startTime).toLocaleTimeString()} <br />
                      <span className="text-white/60 text-xs">{showtime.hallName}</span>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full text-white/60 text-sm">No showtimes available</div>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {showtimes.length > 0 ? (
                <Link
                  href={`/seat-select?showtimeId=${showtimes[0]._id}`}
                  className="inline-flex items-center justify-center rounded-md bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Book Seat
                </Link>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center justify-center rounded-md bg-red-600/50 px-6 py-3 text-sm font-semibold text-white/50 cursor-not-allowed"
                >
                  Book Seat (No Showtimes)
                </button>
              )}
              <Link
                href="/movies"
                className="inline-flex items-center justify-center rounded-md bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20"
              >
                Back to Movies
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
