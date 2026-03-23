export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard label="Total Impressions" value="—" />
        <MetricCard label="Engagement Rate" value="—" />
        <MetricCard label="Follower Growth" value="—" />
      </div>
      <div className="rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold mb-4">Performance Over Time</h2>
        <p className="text-sm text-gray-500">
          Connect an account and publish posts to see analytics data here.
        </p>
      </div>
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
