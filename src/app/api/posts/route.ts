import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createPostSchema = z.object({
  linkedInAccountId: z.string(),
  content: z.string().min(1).max(3000),
  mediaUrls: z.array(z.string().url()).optional(),
  scheduledAt: z.string().datetime().optional(),
  status: z.enum(["DRAFT", "SCHEDULED"]).optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get("accountId");
  const status = searchParams.get("status");
  const month = searchParams.get("month"); // YYYY-MM

  const where: Record<string, unknown> = {
    linkedInAccount: {
      userId: session.user.id,
      ...(accountId && { id: accountId }),
    },
  };

  if (status) where.status = status;

  if (month) {
    const [year, m] = month.split("-").map(Number);
    const start = new Date(year, m - 1, 1);
    const end = new Date(year, m, 1);
    where.OR = [
      { scheduledAt: { gte: start, lt: end } },
      { publishedAt: { gte: start, lt: end } },
      { createdAt: { gte: start, lt: end } },
    ];
  }

  const posts = await db.post.findMany({
    where,
    include: {
      linkedInAccount: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createPostSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { linkedInAccountId, content, mediaUrls, scheduledAt, status } = parsed.data;

  // Verify account belongs to user
  const account = await db.linkedInAccount.findFirst({
    where: { id: linkedInAccountId, userId: session.user.id },
  });
  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const post = await db.post.create({
    data: {
      linkedInAccountId,
      content,
      mediaUrls: mediaUrls ?? [],
      status: scheduledAt ? "SCHEDULED" : status ?? "DRAFT",
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    },
    include: {
      linkedInAccount: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  return NextResponse.json(post, { status: 201 });
}
