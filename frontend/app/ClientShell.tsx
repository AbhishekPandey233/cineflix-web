"use client";

import { usePathname } from "next/navigation";
import Header from "./(navigation)/Header";
import Footer from "./(navigation)/Footer";

export default function ClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideHeader = pathname.startsWith("/admin");
  const showFooter =
    pathname === "/home" ||
    pathname === "/about" ||
    pathname === "/history" ||
    pathname.startsWith("/movies");

  if (hideHeader) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {/* Header is fixed, so push content down */}
      <main className="pt-0">{children}</main>
      {showFooter && <Footer />}
    </>
  );
}
