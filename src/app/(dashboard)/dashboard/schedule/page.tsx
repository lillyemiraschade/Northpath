"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Clock, Trash2, RefreshCw, PenSquare } from "lucide-react";
import AccountSwitcher from "@/components/dashboard/account-switcher";
import { cn } from "@/lib/utils";

interface Account {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface Post {
  id: string;
  content: string;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  linkedInAccount: { id: string; name: string; avatarUrl: string | null };
}

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-700" },
  SCHEDULED: { label: "Scheduled", className: "bg-blue-100 text-blue-700" },
  PUBLISHING: { label: "Publishing...", className: "bg-yellow-100 text-yellow-700 animate-pulse" },
  PUBLISHED: { label: "Published", className: "bg-green-100 text-green-700" },
  FAILED: { label: "Failed", className: "bg-red-100 text-red-700" },
};

export default function SchedulePage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/accounts").then((r) => r.json()).then((data) => setAccounts(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedAccount) params.set("accountId", selectedAccount);
    fetch(`/api/posts?${params}`)
      .then((r) => r.json())
      .then((data) => {
        const all = Array.isArray(data) ? data : [];
        setPosts(all);
        setLoading(false);
      });
  }, [selectedAccount]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleRetry(id: string) {
    const res = await fetch(`/api/posts/${id}/publish`, { method: "POST" });
    if (res.ok) {
      const updated = await res.json();
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status: updated.status } : p)));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">All Posts</h1>
        <button
          onClick={() => router.push("/dashboard/compose")}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
        >
          <PenSquare className="h-4 w-4" />
          New Post
        </button>
      </div>

      <AccountSwitcher
        accounts={accounts}
        selectedId={selectedAccount}
        onSelect={setSelectedAccount}
      />

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <Clock className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No posts here</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create and schedule posts from the Compose page.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const cfg = statusConfig[post.status] ?? statusConfig.DRAFT;
            return (
              <div key={post.id} className="rounded-lg border bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                      {post.linkedInAccount.name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {post.linkedInAccount.name}
                        </span>
                        <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", cfg.className)}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">
                        {post.content}
                      </p>
                      {post.scheduledAt && post.status === "SCHEDULED" && (
                        <p className="mt-2 text-xs text-gray-500">
                          Scheduled for {format(new Date(post.scheduledAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      )}
                      {post.publishedAt && post.status === "PUBLISHED" && (
                        <p className="mt-2 text-xs text-gray-500">
                          Published {format(new Date(post.publishedAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {post.status === "FAILED" && (
                      <button
                        onClick={() => handleRetry(post.id)}
                        className="rounded p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                        title="Retry publishing"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    )}
                    {post.status !== "PUBLISHING" && (
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="rounded p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        title="Delete post"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
