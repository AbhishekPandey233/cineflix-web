"use client";

import Image from "next/image";
import LoginForm from "../_components/LoginForm";

export default function LoginPage() {
  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <Image
        src="/authbackground.jpeg"
        alt="Login background"
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-black/50" />

      <div className="relative h-full grid place-items-center p-4 pt-20">
        <section className="w-full max-w-sm rounded-xl border border-white/15 bg-black/40 backdrop-blur p-5 text-white">
          <h1 className="text-xl font-semibold">Welcome back</h1>
          <p className="mt-1 mb-5 text-xs text-white/70">
            Sign in to continue
          </p>
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
