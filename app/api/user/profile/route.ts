import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// GET - return current user from cookie
export async function GET() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value ?? null;
  if (!userCookie) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  try {
    const user = JSON.parse(userCookie);
    return NextResponse.json({ success: true, data: user });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Malformed user cookie" }, { status: 500 });
  }
}

// PUT - update user cookie (name / email)
export async function PUT(req: Request) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value ?? null;
  if (!userCookie) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { name, email } = body;

  try {
    const user = JSON.parse(userCookie);

    // simple validation
    if (name && typeof name !== "string") return NextResponse.json({ success: false, message: "Invalid name" }, { status: 400 });
    if (email && typeof email !== "string") return NextResponse.json({ success: false, message: "Invalid email" }, { status: 400 });

    const updated = { ...user, name: name ?? user.name, email: email ?? user.email };

    cookieStore.set("user", JSON.stringify(updated), { path: "/" });

    return NextResponse.json({ success: true, message: "Profile updated", data: updated });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Could not update profile" }, { status: 500 });
  }
}
