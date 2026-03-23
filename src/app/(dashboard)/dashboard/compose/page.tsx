"use client";

import { useEffect, useState } from "react";
import { Send, Clock, Save, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useSelectedAccount } from "@/hooks/use-selected-account";
import type { Account } from "@/types";

type Status = "idle" | "saving" | "success" | "error";
type ActionType = "publish" | "schedule" | "draft" | null;

export default function ComposePage() {
  const globalAccount = useSelectedAccount();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState(globalAccount ?? "");
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((data) => {
        const accts = Array.isArray(data) ? data : [];
        setAccounts(accts);
        if (!selectedAccount && accts.length === 1) {
          setSelectedAccount(accts[0].id);
        }
      });
  }, []);

  // Sync with global account switcher
  useEffect(() => {
    if (globalAccount) setSelectedAccount(globalAccount);
  }, [globalAccount]);

  async function handleAction(action: "publish" | "schedule" | "draft") {
    if (!selectedAccount) {
      setStatus("error");
      setMessage("Please select a LinkedIn account");
      return;
    }
    if (!content.trim()) {
      setStatus("error");
      setMessage("Post content cannot be empty");
      return;
    }

    setStatus("saving");
    setActiveAction(action);
    setMessage("");

    const body: Record<string, unknown> = {
      linkedInAccountId: selectedAccount,
      content: content.trim(),
      mediaUrls: mediaUrl.trim() ? [mediaUrl.trim()] : [],
    };

    if (action === "schedule") {
      if (!scheduledAt) {
        setStatus("error");
        setActiveAction(null);
        setMessage("Please select a date and time");
        return;
      }
      body.scheduledAt = new Date(scheduledAt).toISOString();
    } else if (action === "draft" || action === "publish") {
      body.status = "DRAFT";
    }

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to create post");

      const post = await res.json();

      if (action === "publish") {
        const pubRes = await fetch(`/api/posts/${post.id}/publish`, { method: "POST" });
        if (!pubRes.ok) {
          // Publish failed — clean up the orphaned draft
          await fetch(`/api/posts/${post.id}`, { method: "DELETE" }).catch(() => {});
          throw new Error("Failed to publish");
        }
      }

      setStatus("success");
      setActiveAction(null);
      setMessage(
        action === "publish"
          ? "Post published successfully!"
          : action === "schedule"
          ? "Post scheduled successfully!"
          : "Draft saved!"
      );

      setTimeout(() => {
        setContent("");
        setMediaUrl("");
        setScheduledAt("");
        setShowSchedule(false);
        setStatus("idle");
        setMessage("");
      }, 2000);
    } catch {
      setStatus("error");
      setActiveAction(null);
      setMessage("Something went wrong. Please try again.");
    }
  }

  const charCount = content.length;
  const charWarning = charCount > 2700;
  const charError = charCount > 3000;
  const isSaving = status === "saving";

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold">Compose Post</h1>

      {status !== "idle" && message && (
        <div
          className={`flex items-center gap-2 rounded-md p-3 text-sm ${
            status === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : status === "error"
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-blue-50 text-blue-700 border border-blue-200"
          }`}
        >
          {status === "success" && <CheckCircle className="h-4 w-4" />}
          {status === "error" && <AlertCircle className="h-4 w-4" />}
          {message}
        </div>
      )}

      <div className="rounded-lg border bg-white p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            LinkedIn Account
          </label>
          {accounts.length === 0 ? (
            <p className="text-sm text-gray-500">
              No accounts connected.{" "}
              <a href="/dashboard/accounts" className="text-blue-600 hover:underline">
                Connect one first
              </a>
            </p>
          ) : (
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select an account...</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Post Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-none focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Write your LinkedIn post..."
          />
          <p
            className={`text-xs mt-1 ${
              charError ? "text-red-600 font-medium" : charWarning ? "text-amber-600" : "text-gray-400"
            }`}
          >
            {charCount.toLocaleString()} / 3,000 characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Media URL (optional)
          </label>
          <input
            type="url"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {showSchedule && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Schedule Date & Time
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => handleAction("publish")}
            disabled={isSaving || charError}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {activeAction === "publish" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Publish Now
          </button>
          {showSchedule ? (
            <button
              onClick={() => handleAction("schedule")}
              disabled={isSaving || charError}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              {activeAction === "schedule" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              Schedule Post
            </button>
          ) : (
            <button
              onClick={() => setShowSchedule(true)}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
            >
              <Clock className="h-4 w-4" />
              Schedule
            </button>
          )}
          <button
            onClick={() => handleAction("draft")}
            disabled={isSaving || charError}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {activeAction === "draft" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Draft
          </button>
        </div>
      </div>
    </div>
  );
}
