import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen font-sans text-neutral-900 overflow-hidden">
      {/* Background image (GLOBAL) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/71meY6dAvjL.jpg')" }}
      />

      {/* Global dark overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Sidebar (Glass) */}
      <aside className="relative z-20 w-56 border-r border-white/15 bg-white/10 backdrop-blur-md p-5">
        <div className="mb-8 flex items-center gap-2 px-1">
          <div className="h-7 w-7 rounded-md bg-white/80" />
          <span className="text-sm font-bold tracking-tight text-white">
            Admin
          </span>
        </div>

        <nav className="space-y-1">
          <p className="px-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-white/50">
            Management
          </p>

          <Link
            href="/admin/users"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            Users
          </Link>

          <Link
            href="/admin/users/create"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            Create User
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
            bg-black/55
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
