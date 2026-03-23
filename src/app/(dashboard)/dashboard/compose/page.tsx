"use client";

import { useState } from "react";

export default function ComposePage() {
  const [content, setContent] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold">Compose Post</h1>
      <div className="rounded-lg border bg-white p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            LinkedIn Account
          </label>
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Select an account...</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Post Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-none"
            placeholder="Write your LinkedIn post..."
          />
          <p className="text-xs text-gray-400 mt-1">
            {content.length} / 3,000 characters
          </p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors">
            Publish Now
          </button>
          <button className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors">
            Schedule
          </button>
          <button className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors">
            Save Draft
          </button>
        </div>
      </div>
    </div>
  );
}
