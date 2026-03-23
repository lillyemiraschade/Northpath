"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Users, ExternalLink, Trash2, Link2, Loader2 } from "lucide-react";
import type { AccountWithDetails } from "@/types";

export default function AccountsPageWrapper() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-500">Loading...</div>}>
      <AccountsPage />
    </Suspense>
  );
}

function AccountsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<AccountWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [connectStatus, setConnectStatus] = useState<"idle" | "success" | "error">("idle");
  const [connectError, setConnectError] = useState("");

  const success = searchParams.get("success");
  const error = searchParams.get("error");

  const fetchAccounts = useCallback(() => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((data) => {
        setAccounts(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Listen for popup callback
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "linkedin-connected") {
        setConnectStatus("success");
        fetchAccounts();
      } else if (event.data?.type === "linkedin-error") {
        setConnectStatus("error");
        setConnectError(event.data.error ?? "Failed to connect");
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [fetchAccounts]);

  function handleConnect() {
    setConnectStatus("idle");
    setConnectError("");
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    window.open(
      "/api/auth/linkedin/connect",
      "linkedin-connect",
      `width=${width},height=${height},left=${left},top=${top},popup=yes`
    );
  }

  async function handleDisconnect(id: string) {
    if (!confirm("Disconnect this LinkedIn account? All associated posts will be deleted.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAccounts((prev) => prev.filter((a) => a.id !== id));
      }
    } finally {
      setDeleting(null);
    }
  }

  const showSuccess = connectStatus === "success" || success === "connected";
  const showError = connectStatus === "error" || !!error;
  const errorMessage = connectError || (error ? decodeURIComponent(error) : "");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">LinkedIn Accounts</h1>
        <button
          onClick={handleConnect}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
        >
          <Link2 className="h-4 w-4" />
          Connect Account
        </button>
      </div>

      {showSuccess && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700">
          LinkedIn account connected successfully!
        </div>
      )}
      {showError && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          Failed to connect: {errorMessage}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading accounts...</div>
      ) : accounts.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No accounts connected</h3>
          <p className="mt-1 text-sm text-gray-500">
            Connect your LinkedIn accounts to start managing posts and analytics.
          </p>
          <button
            onClick={handleConnect}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            <Link2 className="h-4 w-4" />
            Connect Your First Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((account) => (
            <div key={account.id} className="rounded-lg border bg-white p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                    {account.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{account.name}</h3>
                    <p className="text-sm text-gray-500">{account.postCount} posts</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {account.profileUrl && (
                    <a
                      href={account.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      title="View LinkedIn profile"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleDisconnect(account.id)}
                    disabled={deleting === account.id}
                    className="rounded p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    title="Disconnect account"
                  >
                    {deleting === account.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="mt-4 flex gap-4">
                <button
                  onClick={() => router.push(`/dashboard/compose?account=${account.id}`)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Compose Post
                </button>
                <button
                  onClick={() => router.push(`/dashboard/analytics?account=${account.id}`)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View Analytics
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
