import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { LinkedInClient } from "@/lib/linkedin";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = cookies().get("linkedin_oauth_state")?.value;

  const baseUrl = process.env.NEXTAUTH_URL
    ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(
      new URL("/dashboard/accounts?error=invalid_state", baseUrl)
    );
  }

  cookies().delete("linkedin_oauth_state");

  try {
    const tokenData = await LinkedInClient.exchangeCodeForToken(code);
    const client = new LinkedInClient(tokenData.access_token);
    const userInfo = await client.getUserInfo();

    const tokenExpiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    await db.linkedInAccount.upsert({
      where: { linkedinId: userInfo.sub },
      create: {
        linkedinId: userInfo.sub,
        name: userInfo.name,
        profileUrl: null,
        avatarUrl: userInfo.picture ?? null,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token ?? null,
        tokenExpiresAt,
      },
      update: {
        name: userInfo.name,
        avatarUrl: userInfo.picture ?? null,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token ?? null,
        tokenExpiresAt,
      },
    });

    return NextResponse.redirect(
      new URL("/dashboard/accounts?success=connected", baseUrl)
    );
  } catch (error) {
    console.error("LinkedIn OAuth error:", error);
    return NextResponse.redirect(
      new URL("/dashboard/accounts?error=oauth_failed", baseUrl)
    );
  }
}
