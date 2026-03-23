import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-2xl text-center px-6">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-4">
          Northpath
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Manage multiple LinkedIn accounts from one place. Create posts,
          schedule content, and track analytics across all your profiles.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
