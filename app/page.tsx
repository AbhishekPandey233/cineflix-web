import Image from "next/image";

export default function Home() {
  return (
    <main className="relative h-screen w-full overflow-hidden">
      {/* Background image */}
      <Image
        src="/background.jpg"
        alt="Cineflix hero background"
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-black/50" />
    </main>
  );
}
