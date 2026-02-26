import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="relative min-h-[calc(100vh-56px)] w-full text-white">

      <Image
        src="/aboutpage.png"
        alt="CineFlix background"
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-16">

        <section className="text-center py-16">
          <h1 className="mb-4 text-4xl font-bold md:text-6xl text-white">
            About CineFlix
          </h1>
          <p className="max-w-2xl mx-auto text-white/70 text-lg">
            CineFlix is your one-stop destination for booking movie tickets quickly
            and conveniently. Discover movies, choose showtimes, and book your seats
            effortlessly — all in one place.
          </p>
        </section>

        <section className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="rounded-xl bg-zinc-900/50 p-6 text-center backdrop-blur-sm hover:bg-zinc-900/70 transition">
            <h2 className="mb-2 text-xl font-semibold text-white">
              Latest Movies
            </h2>
            <p className="text-white/70">
              Explore the newest releases, trending films, and all-time favorites
              playing in theaters near you.
            </p>
          </div>

          <div className="rounded-xl bg-zinc-900/50 p-6 text-center backdrop-blur-sm hover:bg-zinc-900/70 transition">
            <h2 className="mb-2 text-xl font-semibold text-white">
              Easy Seat Booking
            </h2>
            <p className="text-white/70">
              Select your preferred showtime, choose your seats, and book tickets
              in just a few clicks.
            </p>
          </div>

          <div className="rounded-xl bg-zinc-900/50 p-6 text-center backdrop-blur-sm hover:bg-zinc-900/70 transition">
            <h2 className="mb-2 text-xl font-semibold text-white">
              Instant Confirmation
            </h2>
            <p className="text-white/70">
              Get instant booking confirmation and digital tickets — no queues,
              no hassle.
            </p>
          </div>
        </section>

      </div>

      <section className="mt-16 bg-zinc-900/50 py-16 px-4 text-center backdrop-blur-sm w-full">
        <h2 className="mb-4 text-3xl font-bold text-white">
          Our Mission
        </h2>
        <p className="max-w-3xl mx-auto text-white/70 text-lg">
          At CineFlix, our mission is to make movie ticket booking simple, fast,
          and enjoyable. We aim to bring the excitement of cinema closer to you
          by eliminating long queues and making every booking experience smooth
          and stress-free.
        </p>

        <div className="mt-10 mx-auto max-w-3xl rounded-xl border border-white/15 bg-black/30 p-6">
          <h3 className="text-2xl font-bold text-white">Help &amp; Support</h3>
          <p className="mt-3 text-white/75 text-lg">
            Contacts: 9746285620, support@cineflix.com
          </p>
        </div>
      </section>

    </main>
  );
}
