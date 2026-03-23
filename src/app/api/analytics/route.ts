import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get("accountId");

  const where = {
    linkedInAccount: {
      userId: session.user.id,
      ...(accountId && { id: accountId }),
    },
  };

  const [analytics, summary] = await Promise.all([
    db.analytics.findMany({
      where,
      include: {
        post: { select: { id: true, content: true, publishedAt: true } },
        linkedInAccount: { select: { id: true, name: true } },
      },
      orderBy: { recordedAt: "desc" },
      take: 100,
    }),
    db.analytics.aggregate({
      where,
      _sum: {
        impressions: true,
        likes: true,
        comments: true,
        shares: true,
        clicks: true,
      },
    }),
  ]);

  return NextResponse.json({
    analytics,
    summary: {
      totalImpressions: summary._sum.impressions ?? 0,
      totalLikes: summary._sum.likes ?? 0,
      totalComments: summary._sum.comments ?? 0,
      totalShares: summary._sum.shares ?? 0,
      totalClicks: summary._sum.clicks ?? 0,
    },
  });
}
