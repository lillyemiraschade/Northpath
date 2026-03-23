"use client";

import { useEffect, useState } from "react";
import AccountSwitcher from "@/components/dashboard/account-switcher";
import { format } from "date-fns";

interface Account {
  id: string;
  name: string;
  avatarUrl: string | null;
  postCount: number;
}

interface Post {
  id: string;
  content: string;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  linkedInAccount: { id: string; name: string; avatarUrl: string | null };
}

interface Stats {
  accounts: number;
  scheduled: number;
  published: number;
  impressions: number;
}

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({ accounts: 0, scheduled: 0, published: 0, impressions: 0 });
  const [upcoming, setUpcoming] = useState<Post[]>([]);
  const [recent, setRecent] = useState<Post[]>([]);

  useEffect(() => {
    fetch("/api/accounts").then((r) => r.json()).then(setAccounts);
  }, []);

  useEffect(() => {
    const qs = selectedAccount ? `?accountId=${selectedAccount}` : "";

    Promise.all([
      fetch(`/api/posts${qs}&status=SCHEDULED`.replace("&", qs ? "&" : "?status=SCHEDULED".replace("?status", "?status"))).then((r) => r.json()),
      fetch(`/api/posts${qs}`).then((r) => r.json()),
      fetch(`/api/analytics${qs}`).then((r) => r.json()),
    ]).then(([scheduled, allPosts, analyticsData]) => {
      const scheduledPosts = Array.isArray(scheduled) ? scheduled : [];
      const all = Array.isArray(allPosts) ? allPosts : [];
      const publishedPosts = all.filter((p: Post) => p.status === "PUBLISHED");

      setStats({
        accounts: selectedAccount ? 1 : accounts.length,
        scheduled: scheduledPosts.length,
        published: publishedPosts.length,
        impressions: analyticsData?.summary?.totalImpressions ?? 0,
      });

      setUpcoming(scheduledPosts.slice(0, 5));
      setRecent(publishedPosts.slice(0, 5));
    });
  }, [selectedAccount, accounts.length]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <AccountSwitcher
        accounts={accounts}
        selectedId={selectedAccount}
        onSelect={setSelectedAccount}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Connected Accounts" value={String(stats.accounts)} />
        <StatCard label="Scheduled Posts" value={String(stats.scheduled)} />
        <StatCard label="Published Posts" value={String(stats.published)} />
        <StatCard label="Total Impressions" value={stats.impressions.toLocaleString()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Upcoming Posts</h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-gray-500">No scheduled posts yet.</p>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((post) => (
                <li key={post.id} className="flex items-start gap-3 text-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    {post.linkedInAccount.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-gray-900">{post.content}</p>
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
          {recent.length === 0 ? (
            <p className="text-sm text-gray-500">No published posts yet.</p>
          ) : (
            <ul className="space-y-3">
              {recent.map((post) => (
                <li key={post.id} className="flex items-start gap-3 text-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                    {post.linkedInAccount.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-gray-900">{post.content}</p>
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
