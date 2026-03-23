import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { LinkedInClient } from "@/lib/linkedin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const cronSecret = req.headers.get("authorization");
  if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sevenDaysFromNow = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  );

  const accounts = await db.linkedInAccount.findMany({
    where: {
      tokenExpiresAt: { lte: sevenDaysFromNow },
      refreshToken: { not: null },
    },
  });

  const results: { accountId: string; success: boolean; error?: string }[] = [];

  for (const account of accounts) {
    try {
      const tokenData = await LinkedInClient.refreshToken(account.refreshToken!);

      const newExpiresAt = new Date(
        Date.now() + tokenData.expires_in * 1000
      );

      await db.linkedInAccount.update({
        where: { id: account.id },
        data: {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token ?? account.refreshToken,
          tokenExpiresAt: newExpiresAt,
        },
      });

      results.push({ accountId: account.id, success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`Failed to refresh token for account ${account.id}:`, message);
      results.push({ accountId: account.id, success: false, error: message });
    }
  }

  const refreshed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  return NextResponse.json({
    total: accounts.length,
    refreshed,
    failed,
    results,
  });
}
