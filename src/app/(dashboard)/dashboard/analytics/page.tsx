"use client";

import { useEffect, useState } from "react";
import { useSelectedAccount } from "@/hooks/use-selected-account";
import AnalyticsCharts from "@/components/dashboard/analytics-charts";

interface Summary {
  totalImpressions: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalClicks: number;
}

interface AnalyticsRecord {
  id: string;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  recordedAt: string;
  linkedInAccount: { id: string; name: string };
  post: { id: string; content: string; publishedAt: string } | null;
}

export default function AnalyticsPage() {
  const selectedAccount = useSelectedAccount();
  const [summary, setSummary] = useState<Summary>({ totalImpressions: 0, totalLikes: 0, totalComments: 0, totalShares: 0, totalClicks: 0 });
  const [records, setRecords] = useState<AnalyticsRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedAccount) params.set("accountId", selectedAccount);
    fetch(`/api/analytics?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setSummary(data.summary ?? { totalImpressions: 0, totalLikes: 0, totalComments: 0, totalShares: 0, totalClicks: 0 });
        setRecords(Array.isArray(data.analytics) ? data.analytics : []);
        setLoading(false);
      });
  }, [selectedAccount]);

  const totalEngagement = summary.totalLikes + summary.totalComments + summary.totalShares;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Impressions" value={summary.totalImpressions.toLocaleString()} />
        <MetricCard label="Total Engagement" value={totalEngagement.toLocaleString()} />
        <MetricCard label="Total Clicks" value={summary.totalClicks.toLocaleString()} />
        <MetricCard
          label="Engagement Rate"
          value={
            summary.totalImpressions > 0
              ? `${((totalEngagement / summary.totalImpressions) * 100).toFixed(1)}%`
              : "—"
          }
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading analytics...</div>
      ) : records.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <p className="text-gray-500">
            No analytics data yet. Publish posts to see performance metrics here.
          </p>
        </div>
      ) : (
        <AnalyticsCharts records={records} />
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-6">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}
