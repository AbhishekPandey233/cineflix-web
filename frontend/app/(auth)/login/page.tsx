"use client";

import Image from "next/image";
import LoginForm from "../_components/LoginForm";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black pt-14 text-white">
      <Image
        src="/authbackground.jpeg"
        alt="Login background"
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-black/75" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-6xl items-center justify-center px-6 py-6 md:px-12">
        <section className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-md md:p-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            <span className="h-[2px] w-6 bg-red-600" />
            CineFlix Access
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome
            <span className="text-red-500"> Back</span>
          </h1>
          <p className="mb-6 mt-2 text-sm text-white/70">Sign in to continue booking your next show.</p>
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
