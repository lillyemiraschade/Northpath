import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import { LinkedInClient } from "@/lib/linkedin";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL));
  }

  const state = randomBytes(16).toString("hex");

  cookies().set("linkedin_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 300,
    path: "/",
  });

  const url = LinkedInClient.getAuthorizationUrl(state);
  return NextResponse.redirect(url);
}
