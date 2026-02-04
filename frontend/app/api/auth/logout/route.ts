import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();

  // Clear authentication cookies by setting empty value and maxAge 0
  cookieStore.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  cookieStore.set("user", "", {
    path: "/",
    maxAge: 0,
  });

  cookieStore.set("role", "", {
    path: "/",
    maxAge: 0,
  });

  return NextResponse.json({ success: true, message: "Logged out" });
}