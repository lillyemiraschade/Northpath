import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updatePostSchema = z.object({
  content: z.string().min(1).max(3000).optional(),
  mediaUrls: z.array(z.string().url()).optional(),
  scheduledAt: z.string().datetime().nullable().optional(),
  status: z.enum(["DRAFT", "SCHEDULED"]).optional(),
});

async function getOwnedPost(postId: string, userId: string) {
  return db.post.findFirst({
    where: { id: postId, linkedInAccount: { userId } },
    include: { linkedInAccount: true },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const post = await getOwnedPost(params.id, session.user.id);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(post);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const post = await getOwnedPost(params.id, session.user.id);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (post.status === "PUBLISHED" || post.status === "PUBLISHING") {
    return NextResponse.json({ error: "Cannot edit a published post" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = updatePostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.content !== undefined) data.content = parsed.data.content;
  if (parsed.data.mediaUrls !== undefined) data.mediaUrls = parsed.data.mediaUrls;
  if (parsed.data.scheduledAt !== undefined) {
    data.scheduledAt = parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null;
  }
  if (parsed.data.status !== undefined) data.status = parsed.data.status;

  const updated = await db.post.update({
    where: { id: params.id },
    data,
    include: {
      linkedInAccount: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const post = await getOwnedPost(params.id, session.user.id);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (post.status === "PUBLISHING") {
    return NextResponse.json({ error: "Cannot delete while publishing" }, { status: 400 });
  }

  await db.post.delete({ where: { id: params.id } });

  return new NextResponse(null, { status: 204 });
}
