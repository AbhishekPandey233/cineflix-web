import Link from "next/link";
import Image from "next/image";

export default function Dashboard() {
  return (
    <main className="relative h-screen w-full overflow-hidden text-white">

      <Image
        src="/dashboard.jpeg"
        alt="CineFlix dashboard background"
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-6 text-center">

        <h1 className="mb-4 text-4xl font-bold md:text-6xl">
          Welcome to <span className="text-red-600">CineFlix</span>
        </h1>

        <p className="mb-8 max-w-xl text-white/70">
          Your one-stop destination for booking movies effortlessly, faster,
          and smarter — all in one place!
        </p>

        <div className="flex gap-4">
          <Link
            href="/home"
            className="rounded-md bg-red-600 px-6 py-3 text-sm font-semibold hover:bg-red-700 transition"
          >
            Enter Home
          </Link>

          <Link
            href="/login"
            className="rounded-md border border-white/20 px-6 py-3 text-sm font-semibold hover:bg-white/10 transition"
          >
            Login
          </Link>
        </div>

      </div>
    </main>
  );
}
