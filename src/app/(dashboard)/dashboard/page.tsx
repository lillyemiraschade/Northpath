export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Connected Accounts" value="0" />
        <StatCard label="Scheduled Posts" value="0" />
        <StatCard label="Published This Week" value="0" />
        <StatCard label="Total Impressions" value="0" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Upcoming Posts</h2>
          <p className="text-sm text-gray-500">
            No scheduled posts yet. Create your first post to get started.
          </p>
        </section>
        <section className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <p className="text-sm text-gray-500">
            Connect a LinkedIn account to see activity here.
          </p>
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
