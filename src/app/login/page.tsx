"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Invalid access code");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-xs space-y-6 rounded-xl border bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-600">Northpath</h1>
          <p className="mt-1 text-sm text-gray-500">Enter your access code</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-md bg-red-50 p-3 text-sm text-red-600 text-center">{error}</p>
          )}
          <input
            type="password"
            inputMode="numeric"
            maxLength={8}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
            placeholder="8-digit code"
            className="block w-full rounded-md border border-gray-300 px-3 py-3 text-center text-lg tracking-[0.3em] font-mono shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading || code.length < 8}
            className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {loading ? "Verifying..." : "Enter"}
          </button>
        </form>
      </div>
    </main>
  );
}
