import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getLinkedInClient } from "@/lib/linkedin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find all posts that are scheduled and due for publishing
  const duePosts = await db.post.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lte: now },
    },
    include: {
      linkedInAccount: true,
    },
  });

  const results: Array<{
    postId: string;
    status: "PUBLISHED" | "FAILED";
    error?: string;
  }> = [];

  for (const post of duePosts) {
    try {
      const client = await getLinkedInClient(post.linkedInAccountId);
      const linkedinPostId = await client.createPost(
        post.linkedInAccount.linkedinId,
        post.content,
        post.mediaUrls.length > 0 ? post.mediaUrls : undefined
      );

      await db.post.update({
        where: { id: post.id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
          linkedinPostId,
        },
      });

      results.push({ postId: post.id, status: "PUBLISHED" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";

      await db.post.update({
        where: { id: post.id },
        data: { status: "FAILED" },
      });

      results.push({ postId: post.id, status: "FAILED", error: message });
    }
  }

  return NextResponse.json({
    processed: results.length,
    results,
  });
}
