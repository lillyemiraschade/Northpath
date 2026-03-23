import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const ACCESS_CODE = process.env.ACCESS_CODE ?? "04040404";

export async function POST(req: NextRequest) {
  const { code } = await req.json();

  if (code !== ACCESS_CODE) {
    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  cookies().set("northpath_session", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  return NextResponse.json({ ok: true });
}
