import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get("accountId");

  const analytics = await db.analytics.findMany({
    where: accountId ? { linkedInAccountId: accountId } : {},
    include: {
      post: { select: { id: true, content: true, publishedAt: true } },
    },
    orderBy: { recordedAt: "desc" },
    take: 50,
  });

  const summary = await db.analytics.aggregate({
    where: accountId ? { linkedInAccountId: accountId } : {},
    _sum: {
      impressions: true,
      likes: true,
      comments: true,
      shares: true,
      clicks: true,
    },
  });

  return NextResponse.json({ analytics, summary: summary._sum });
}
