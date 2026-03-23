"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { PenSquare } from "lucide-react";
import { useSelectedAccount } from "@/hooks/use-selected-account";
import type { Post } from "@/types";

interface Stats {
  scheduled: number;
  published: number;
  impressions: number;
}

export default function DashboardPage() {
  const selectedAccount = useSelectedAccount();
  const [stats, setStats] = useState<Stats>({ scheduled: 0, published: 0, impressions: 0 });
  const [upcoming, setUpcoming] = useState<Post[]>([]);
  const [recent, setRecent] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const qs = selectedAccount ? `?accountId=${selectedAccount}` : "";

    Promise.all([
      fetch(`/api/posts${qs}`).then((r) => r.json()),
      fetch(`/api/analytics${qs}`).then((r) => r.json()),
    ]).then(([allPosts, analyticsData]) => {
      const all = Array.isArray(allPosts) ? allPosts : [];
      const scheduled = all.filter((p: Post) => p.status === "SCHEDULED");
      const published = all.filter((p: Post) => p.status === "PUBLISHED");

      setStats({
        scheduled: scheduled.length,
        published: published.length,
        impressions: analyticsData?.summary?.totalImpressions ?? 0,
      });

      setUpcoming(scheduled.slice(0, 5));
      setRecent(published.slice(0, 5));
      setLoading(false);
    });
  }, [selectedAccount]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <>
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </>
        ) : (
          <>
            <StatCard label="Scheduled Posts" value={String(stats.scheduled)} />
            <StatCard label="Published Posts" value={String(stats.published)} />
            <StatCard label="Total Impressions" value={stats.impressions.toLocaleString()} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Upcoming Posts</h2>
          {loading ? (
            <div className="space-y-3">
              <SkeletonPostRow />
              <SkeletonPostRow />
              <SkeletonPostRow />
            </div>
          ) : upcoming.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-3">No scheduled posts yet.</p>
              <Link
                href="/dashboard/compose"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
              >
                <PenSquare className="h-4 w-4" />
                Compose a Post
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((post) => (
                <li key={post.id} className="flex items-start gap-3 text-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    {post.linkedInAccount.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-900 line-clamp-3 whitespace-pre-wrap">{post.content}</p>
                    <p className="text-xs text-gray-500">
                      {post.scheduledAt && format(new Date(post.scheduledAt), "MMM d, yyyy 'at' h:mm a")}
                      {" · "}{post.linkedInAccount.name}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          {loading ? (
            <div className="space-y-3">
              <SkeletonPostRow />
              <SkeletonPostRow />
              <SkeletonPostRow />
            </div>
          ) : recent.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-3">No published posts yet.</p>
              <Link
                href="/dashboard/compose"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
              >
                <PenSquare className="h-4 w-4" />
                Compose a Post
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {recent.map((post) => (
                <li key={post.id} className="flex items-start gap-3 text-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                    {post.linkedInAccount.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-900 line-clamp-3 whitespace-pre-wrap">{post.content}</p>
                    <p className="text-xs text-gray-500">
                      Published {post.publishedAt && format(new Date(post.publishedAt), "MMM d, yyyy")}
                      {" · "}{post.linkedInAccount.name}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-6">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

function SkeletonStatCard() {
  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
      <div className="h-8 w-16 rounded bg-gray-200 animate-pulse mt-2" />
    </div>
  );
}

function SkeletonPostRow() {
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 shrink-0 rounded-full bg-gray-200 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
}
