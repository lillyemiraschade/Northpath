import { Worker } from "bullmq";
import IORedis from "ioredis";
import { PrismaClient } from "@prisma/client";
import { LinkedInClient } from "../src/lib/linkedin";

const db = new PrismaClient();
const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "post-publisher",
  async (job) => {
    const { postId } = job.data;

    const post = await db.post.findUnique({
      where: { id: postId },
      include: { linkedInAccount: true },
    });

    if (!post || post.status !== "SCHEDULED") {
      console.log(`Post ${postId} not found or not scheduled, skipping`);
      return;
    }

    await db.post.update({
      where: { id: postId },
      data: { status: "PUBLISHING" },
    });

    try {
      const client = new LinkedInClient(post.linkedInAccount.accessToken);
      const linkedinPostId = await client.createPost(
        post.linkedInAccount.linkedinId,
        post.content,
        post.mediaUrls.length > 0 ? post.mediaUrls : undefined
      );

      await db.post.update({
        where: { id: postId },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
          linkedinPostId,
        },
      });

      console.log(`Published post ${postId} as ${linkedinPostId}`);
    } catch (error) {
      console.error(`Failed to publish post ${postId}:`, error);
      await db.post.update({
        where: { id: postId },
        data: { status: "FAILED" },
      });
    }
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

console.log("Northpath post scheduler worker started");
