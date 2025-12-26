import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Left: Brand */}
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-white text-black font-bold">
            M
          </span>
          <span className="font-semibold text-white">MyApp</span>
        </Link>

        {/* Center: Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
          <Link href="/" className="hover:text-white">
            Home
          </Link>
          <Link href="/about" className="hover:text-white">
            About
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="h-9 rounded-md border border-white/15 px-4 text-sm font-semibold text-white hover:bg-white/5"
          >
            Log in
          </Link>

          <Link
            href="/register"
            className="h-9 rounded-md bg-white px-4 text-sm font-semibold text-black hover:opacity-90"
          >
            Sign up
          </Link>

          <button
            type="button"
            aria-label="Theme"
            className="grid h-9 w-9 place-items-center rounded-md border border-white/15 text-white hover:bg-white/5"
          >
            {/* simple monitor icon */}
            <span className="text-base">🖥️</span>
          </button>
        </div>
      </div>
    </header>
  );
}
