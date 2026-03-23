export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Scheduled Posts</h1>
      </div>
      <div className="rounded-lg border bg-white p-8 text-center">
        <p className="text-gray-500">
          No scheduled posts. Use the Compose page to schedule your first post.
        </p>
      </div>
    </div>
  );
}
