import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import { LinkedInClient } from "@/lib/linkedin";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL));
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = cookies().get("linkedin_oauth_state")?.value;

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(
      new URL("/dashboard/accounts?error=invalid_state", process.env.NEXTAUTH_URL)
    );
  }

  cookies().delete("linkedin_oauth_state");

  try {
    const tokenData = await LinkedInClient.exchangeCodeForToken(code);
    const client = new LinkedInClient(tokenData.access_token);
    const profile = await client.getProfile();

    const name = `${profile.localizedFirstName} ${profile.localizedLastName}`;
    const tokenExpiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    await db.linkedInAccount.upsert({
      where: { linkedinId: profile.id },
      create: {
        userId: session.user.id,
        linkedinId: profile.id,
        name,
        profileUrl: profile.vanityName
          ? `https://linkedin.com/in/${profile.vanityName}`
          : null,
        avatarUrl: profile.profilePicture?.displayImage ?? null,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token ?? null,
        tokenExpiresAt,
      },
      update: {
        name,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token ?? null,
        tokenExpiresAt,
      },
    });

    return NextResponse.redirect(
      new URL("/dashboard/accounts?success=connected", process.env.NEXTAUTH_URL)
    );
  } catch (error) {
    console.error("LinkedIn OAuth error:", error);
    return NextResponse.redirect(
      new URL("/dashboard/accounts?error=oauth_failed", process.env.NEXTAUTH_URL)
    );
  }
}
