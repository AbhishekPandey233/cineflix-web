import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value ?? null;

  try {
    // Read raw request body as ArrayBuffer and forward as buffer to backend
    const raw = await req.arrayBuffer();

    // Build headers to forward but let backend compute content-length
    const forwardedHeaders: Record<string, string> = {};
    for (const [k, v] of req.headers) {
      const lk = k.toLowerCase();
      if (lk === "host" || lk === "content-length") continue;
      forwardedHeaders[k] = v as string;
    }
    if (token) forwardedHeaders["authorization"] = `Bearer ${token}`;

    console.log("Forwarding avatar upload to backend", { url: `${BACKEND}/api/users/avatar`, contentType: forwardedHeaders["content-type"] });

    const res = await fetch(`${BACKEND}/api/users/avatar`, {
      method: "POST",
      headers: forwardedHeaders,
      // Node fetch accepts a Buffer
      body: Buffer.from(raw),
    });

    const resText = await res.text().catch(() => "");
    let data: { message?: string; url?: string; data?: { url?: string } } | null = null;
    try {
      data = resText ? JSON.parse(resText) : null;
    } catch (err) {
      // leave data null
    }

    if (!res.ok) {
      const message = data?.message || resText || `Upload failed (${res.status})`;
      console.error("Avatar upload failed (forward)", { status: res.status, body: resText });
      return NextResponse.json({ success: false, message }, { status: res.status });
    }

    const avatarUrl = data?.url ?? data?.data?.url ?? null;

    // update user cookie if present
    const userCookie = cookieStore.get("user")?.value ?? null;
    if (userCookie && avatarUrl) {
      try {
        const user = JSON.parse(userCookie);
        const updated = { ...user, avatar: avatarUrl };
        cookieStore.set("user", JSON.stringify(updated), { path: "/" });
      } catch (err) {
        // ignore cookie parse errors
      }
    }

    return NextResponse.json({ success: true, url: avatarUrl });
  } catch (err) {
    console.error("Avatar forward error", err);
    return NextResponse.json({ success: false, message: "Could not upload avatar" }, { status: 500 });
  }
}
