import Link from "next/link";
import Image from "next/image";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen overflow-hidden font-sans text-white">
      {/* Background image (GLOBAL) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/71meY6dAvjL.jpg')" }}
      />

      {/* Global dark overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Sidebar (Glass) */}
      <aside className="relative z-20 w-56 border-r border-white/10 bg-black/65 p-5 backdrop-blur-md">
        <div className="mb-8 flex items-center gap-2 px-1">
          <div className="relative h-8 w-8 overflow-hidden rounded-md border border-white/15 bg-white/5">
            <Image
              src="/cineflix.png"
              alt="CineFlix logo"
              fill
              className="object-cover"
            />
          </div>
          <span className="text-sm font-bold tracking-tight text-white">
            CineFlix Admin
          </span>
        </div>

        <nav className="space-y-1">
          <p className="px-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-white/50">
            Management
          </p>

          <Link
            href="/admin/users"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-red-400"
          >
            Users
          </Link>

          <Link
            href="/admin/users/create"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-red-400"
          >
            Create User
          </Link>

          <Link
            href="/admin/movies"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-red-400"
          >
            Movies
          </Link>

          <Link
            href="/admin/movies/create"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-red-400"
          >
            Create Movie
          </Link>

          <Link
            href="/admin/bookings"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-red-400"
          >
            Bookings
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 p-4 lg:p-6">
        <div
          className="
            min-h-[calc(100vh-2rem)]
            rounded-2xl
            border border-white/20
            bg-black/60
            p-6 lg:p-8
            backdrop-blur-sm
            shadow-2xl
            text-white
          "
        >
          {children}
        </div>
        
      </main>
    </div>
  );
}
