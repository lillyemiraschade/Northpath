import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { LinkedInClient } from "@/lib/linkedin";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const post = await db.post.findUnique({
    where: { id: params.id },
    include: { linkedInAccount: true },
  });

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (post.status === "PUBLISHED") {
    return NextResponse.json({ error: "Already published" }, { status: 400 });
  }

  await db.post.update({
    where: { id: params.id },
    data: { status: "PUBLISHING" },
  });

  try {
    const client = new LinkedInClient(post.linkedInAccount.accessToken);
    const linkedinPostId = await client.createPost(
      post.linkedInAccount.linkedinId,
      post.content,
      post.mediaUrls.length > 0 ? post.mediaUrls : undefined
    );

    const updated = await db.post.update({
      where: { id: params.id },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
        linkedinPostId,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    await db.post.update({
      where: { id: params.id },
      data: { status: "FAILED" },
    });

    console.error("Publish error:", error);
    return NextResponse.json({ error: "Failed to publish" }, { status: 500 });
  }
}
