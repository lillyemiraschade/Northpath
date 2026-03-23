import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await db.linkedInAccount.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      profileUrl: true,
      linkedinId: true,
      tokenExpiresAt: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          analytics: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const mapped = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    avatarUrl: a.avatarUrl,
    profileUrl: a.profileUrl,
    linkedinId: a.linkedinId,
    tokenExpiresAt: a.tokenExpiresAt,
    createdAt: a.createdAt,
    postCount: a._count.posts,
  }));

  return NextResponse.json(mapped);
}
