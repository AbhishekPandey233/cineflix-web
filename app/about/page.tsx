import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="relative min-h-[calc(100vh-56px)] w-full text-white">

      {/* Background Image */}
      <Image
        src="/background.jpg"
        alt="CineFlix background"
        fill
        priority
        className="object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-16">

        {/* Hero Section */}
        <section className="text-center py-16">
          <h1 className="mb-4 text-4xl font-bold md:text-6xl text-white">About CineFlix</h1>
          <p className="max-w-2xl mx-auto text-white/70 text-lg">
            CineFlix is your ultimate destination for movies, shows, and cinematic experiences.
            Watch anywhere, anytime, and immerse yourself in the world of entertainment.
          </p>
        </section>

        {/* Features Section */}
        <section className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="rounded-xl bg-zinc-900/50 p-6 text-center backdrop-blur-sm hover:bg-zinc-900/70 transition">
            <h2 className="mb-2 text-xl font-semibold text-white">Unlimited Movies</h2>
            <p className="text-white/70">
              Stream thousands of movies from all genres, from classics to the latest releases.
            </p>
          </div>
          <div className="rounded-xl bg-zinc-900/50 p-6 text-center backdrop-blur-sm hover:bg-zinc-900/70 transition">
            <h2 className="mb-2 text-xl font-semibold text-white">Any Device</h2>
            <p className="text-white/70">
              Watch on your phone, tablet, or TV. Cinema-quality entertainment wherever you are.
            </p>
          </div>
          <div className="rounded-xl bg-zinc-900/50 p-6 text-center backdrop-blur-sm hover:bg-zinc-900/70 transition">
            <h2 className="mb-2 text-xl font-semibold text-white">Cancel Anytime</h2>
            <p className="text-white/70">
              No long-term commitments. Start, pause, or cancel your subscription anytime.
            </p>
          </div>
        </section>

      </div>

      {/* Mission Section  */}
      <section className="mt-16 bg-zinc-900/50 py-16 px-4 text-center backdrop-blur-sm w-full">
        <h2 className="mb-4 text-3xl font-bold text-white">Our Mission</h2>
        <p className="max-w-3xl mx-auto text-white/70 text-lg">
          At CineFlix, we believe entertainment should be seamless, accessible, and immersive.
          Our goal is to bring the magic of cinema directly to your screen, wherever you are.
        </p>
      </section>

    </main>
  );
}
