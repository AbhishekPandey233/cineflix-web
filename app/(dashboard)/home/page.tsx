"use client";

import Image from "next/image";
import Link from "next/link";

const sampleMovies = [
  {
    id: "1",
    title: "Aa Bata Aama",
    genre: "Nepali | Family,Drama",
    rating: "PG-13",
    img: "/71meY6dAvjL.jpg",
    year: 2025,
    score: 4.2,
  },
  {
    id: "2",
    title: "Ocean Whisper",
    genre: "Drama | Romance",
    rating: "PG",
    img: "/71meY6dAvjL.jpg",
    year: 2024,
    score: 4.0,
  },
  {
    id: "3",
    title: "Skyline Fury",
    genre: "Action | Adventure",
    rating: "R",
    img: "/71meY6dAvjL.jpg",
    year: 2025,
    score: 4.5,
  },
  {
    id: "4",
    title: "The Last Reel",
    genre: "Mystery",
    rating: "PG-13",
    img: "/71meY6dAvjL.jpg",
    year: 2023,
    score: 3.9,
  },
];

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

export default function HomePage() {
  return (
<main className="relative min-h-screen w-full overflow-hidden bg-black text-white pt-14">
      {/* Cinematic Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

      {/* Content Container */}
      <div className="relative z-10 flex h-full flex-col justify-center px-6 md:px-20 max-w-5xl">
        {/* Subtle Badge */}
        <div className="mb-4 flex items-center gap-2">
          <span className="h-[2px] w-8 bg-red-600"></span>
          <span className="text-xs font-bold uppercase tracking-widest text-red-500">
            Now Streaming & In Cinemas
          </span>
        </div>

        <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl">
          New Movies,
          <br />
          <span className="text-red-600">BlockBusters!!</span>
        </h1>

        <p className="mb-8 max-w-lg text-lg text-neutral-300 md:text-xl leading-relaxed">
          Book anywhere. Cancel anytime. Experience cinema like never before with
          <span className="text-white font-semibold"> CineFlix</span> premium seating.
        </p>

        <div className="flex flex-wrap gap-4">
          <button className="group relative overflow-hidden rounded-md bg-red-600 px-8 py-4 text-sm font-bold transition-all hover:bg-red-700 hover:shadow-[0_0_20px_rgba(220,38,38,0.5)]">
            <span className="relative z-10">BOOK TICKETS NOW</span>
          </button>

          <button className="rounded-md border border-neutral-700 bg-black/40 backdrop-blur-md px-8 py-4 text-sm font-bold transition-all hover:bg-neutral-900 hover:border-red-600">
            WATCH TRAILER
          </button>
        </div>
      </div>

      {/* Now Showing Grid */}
      <section className="relative z-10 mt-12 px-6 md:px-20 pb-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-red-500">Now Showing</h2>
            <Link href="/movies" className="text-sm text-neutral-300 hover:text-red-500">
              View all
            </Link>
          </div>

          {/* NEW CARD STYLE */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sampleMovies.map((movie) => (
              <article
                key={movie.id}
                className="group relative overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 transition hover:-translate-y-1 hover:ring-white/20"
              >
                {/* Poster */}
                <div className="relative h-[420px] w-full">
                  <Image
                    src={movie.img}
                    alt={movie.title}
                    fill
                    className="object-cover"
                  />

                  {/* subtle top fade */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />

                  {/* Rating badge (left top like poster text) */}
                  <div className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-1 text-xs font-semibold text-white backdrop-blur-md">
                    {movie.rating}
                  </div>

                  {/* Buy button centered */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      className="rounded-lg bg-sky-600/80 px-6 py-3 text-sm font-bold text-white backdrop-blur-md shadow-lg transition
                                 opacity-0 group-hover:opacity-100 group-hover:scale-105"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>

                {/* Bottom info panel (rounded like your image) */}
                <div className="rounded-t-2xl bg-neutral-900/90 px-4 py-4 backdrop-blur-md">
                  <h3 className="text-lg font-bold text-white leading-6">{movie.title}</h3>
                  <p className="mt-1 text-sm text-white/70">{movie.genre}</p>

                  <div className="mt-3 flex items-center justify-between">
                    <RatingStars score={movie.score} />
                    <span className="text-sm text-white/60">{movie.year}</span>
                  </div>

                  <div className="mt-4">
                    <Link
                      href={`/movies/${movie.id}`}
                      className="inline-flex w-full items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 transition"
                    >
                      Book Tickets
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Extras */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6 shadow-sm">
              <h4 className="text-red-500 font-semibold">Member Perks</h4>
              <p className="mt-2 text-sm text-slate-400">
                Earn points on every booking and redeem free tickets, snacks, and upgrades.
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6 shadow-sm">
              <h4 className="text-red-500 font-semibold">Safe Seating</h4>
              <p className="mt-2 text-sm text-slate-400">
                Advanced seating map helps you choose the best seats with social distance options.
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6 shadow-sm">
              <h4 className="text-red-500 font-semibold">Concessions</h4>
              <p className="mt-2 text-sm text-slate-400">
                Pre-order snacks and pickup at express counters to save time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
