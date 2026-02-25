import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-black text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-4 md:px-10">
        <div>
          <h3 className="text-2xl font-bold">CineFlix</h3>
          <p className="mt-4 text-white/65 leading-8">
            CineFlix is your go-to platform for discovering movies, choosing showtimes,
            and booking cinema tickets in just a few clicks.
          </p>
        </div>

        <div>
          <h4 className="text-2xl font-bold">For moviegoers</h4>
          <ul className="mt-4 space-y-2 text-white/65">
            <li>
              <Link href="/movies" className="hover:text-white transition">
                Browse movies
              </Link>
            </li>
            <li>
              <Link href="/movies" className="hover:text-white transition">
                Book tickets
              </Link>
            </li>
            <li>
              <Link href="/history" className="hover:text-white transition">
                Booking history
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-white transition">
                Sign in
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-2xl font-bold">About company</h4>
          <ul className="mt-4 space-y-2 text-white/65">
            <li>
              <Link href="/about" className="hover:text-white transition">
                About CineFlix
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white transition">
                Our mission
              </Link>
            </li>
            <li>
              <Link href="/movies" className="hover:text-white transition">
                Latest releases
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-2xl font-bold">Contact</h4>
          <ul className="mt-4 space-y-2 text-white/65">
            <li>9746285621</li>
            <li>support@cineflix.com</li>
            <li>@cineflix</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-6 text-center text-white/55 md:px-10">
        © {year} CineFlix. All rights reserved.
      </div>
    </footer>
  );
}
