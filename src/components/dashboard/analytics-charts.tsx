"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";

interface AnalyticsRecord {
  id: string;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  recordedAt: string;
  post: { id: string; content: string; publishedAt: string } | null;
}

interface Props {
  records: AnalyticsRecord[];
}

export default function AnalyticsCharts({ records }: Props) {
  const timeSeriesData = useMemo(() => {
    const grouped = new Map<string, { impressions: number; likes: number; comments: number; shares: number; clicks: number }>();

    for (const r of records) {
      const date = format(parseISO(r.recordedAt), "MMM d");
      const existing = grouped.get(date) ?? { impressions: 0, likes: 0, comments: 0, shares: 0, clicks: 0 };
      existing.impressions += r.impressions;
      existing.likes += r.likes;
      existing.comments += r.comments;
      existing.shares += r.shares;
      existing.clicks += r.clicks;
      grouped.set(date, existing);
    }

    return Array.from(grouped.entries())
      .map(([date, data]) => ({ date, ...data }))
      .reverse();
  }, [records]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold mb-4">Impressions Over Time</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="impressions"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold mb-4">Engagement Breakdown</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="likes" fill="#3b82f6" name="Likes" />
              <Bar dataKey="comments" fill="#8b5cf6" name="Comments" />
              <Bar dataKey="shares" fill="#10b981" name="Shares" />
              <Bar dataKey="clicks" fill="#f59e0b" name="Clicks" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {records.length > 0 && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Per-Post Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 pr-4 font-medium">Post</th>
                  <th className="pb-2 pr-4 font-medium text-right">Impressions</th>
                  <th className="pb-2 pr-4 font-medium text-right">Likes</th>
                  <th className="pb-2 pr-4 font-medium text-right">Comments</th>
                  <th className="pb-2 pr-4 font-medium text-right">Shares</th>
                  <th className="pb-2 font-medium text-right">Clicks</th>
                </tr>
              </thead>
              <tbody>
                {records
                  .filter((r) => r.post)
                  .map((r) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 max-w-xs truncate">
                        {r.post!.content.slice(0, 80)}
                        {r.post!.content.length > 80 ? "..." : ""}
                      </td>
                      <td className="py-3 pr-4 text-right">{r.impressions.toLocaleString()}</td>
                      <td className="py-3 pr-4 text-right">{r.likes.toLocaleString()}</td>
                      <td className="py-3 pr-4 text-right">{r.comments.toLocaleString()}</td>
                      <td className="py-3 pr-4 text-right">{r.shares.toLocaleString()}</td>
                      <td className="py-3 text-right">{r.clicks.toLocaleString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
