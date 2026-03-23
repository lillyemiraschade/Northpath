import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { LinkedInClient } from "@/lib/linkedin";
import { db } from "@/lib/db";

function popupResponse(type: "linkedin-connected" | "linkedin-error", error?: string) {
  const message = JSON.stringify({ type, error });
  const html = `<!DOCTYPE html><html><body><script>
    window.opener?.postMessage(${message}, "*");
    window.close();
  </script><p>You can close this window.</p></body></html>`;
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const storedState = cookies().get("linkedin_oauth_state")?.value;

  if (error) {
    return popupResponse("linkedin-error", `linkedin_${error}`);
  }

  if (!code) {
    return popupResponse("linkedin-error", "no_code");
  }

  if (storedState && state !== storedState) {
    return popupResponse("linkedin-error", "invalid_state");
  }

  try {
    cookies().delete("linkedin_oauth_state");
  } catch {
    // Cookie may already be gone
  }

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

    return popupResponse("linkedin-connected");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("LinkedIn OAuth error:", message, err);
    return popupResponse("linkedin-error", message);
  }
}
