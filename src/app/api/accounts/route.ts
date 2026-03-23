import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const accounts = await db.linkedInAccount.findMany({
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      profileUrl: true,
      _count: { select: { posts: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(accounts);
}
