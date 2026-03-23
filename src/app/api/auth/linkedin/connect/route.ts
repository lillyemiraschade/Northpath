import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { LinkedInClient } from "@/lib/linkedin";

export async function GET() {
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
