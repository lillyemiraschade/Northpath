export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">LinkedIn Accounts</h1>
        <a
          href="/api/auth/linkedin/connect"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
        >
          Connect Account
        </a>
      </div>
      <div className="rounded-lg border bg-white p-8 text-center">
        <p className="text-gray-500">
          No LinkedIn accounts connected yet. Click &quot;Connect Account&quot;
          to link your first profile.
        </p>
      </div>
    </div>
  );
}
