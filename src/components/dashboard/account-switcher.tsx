"use client";

import { cn } from "@/lib/utils";

interface Account {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface AccountSwitcherProps {
  accounts: Account[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  showAll?: boolean;
}

export default function AccountSwitcher({
  accounts,
  selectedId,
  onSelect,
  showAll = true,
}: AccountSwitcherProps) {
  if (accounts.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No accounts connected.{" "}
        <a href="/dashboard/accounts" className="text-blue-600 hover:underline">
          Connect one
        </a>
      </p>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {showAll && (
        <button
          onClick={() => onSelect(null)}
          className={cn(
            "rounded-full px-3 py-1 text-sm font-medium transition-colors border",
            selectedId === null
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
          )}
        >
          All Accounts
        </button>
      )}
      {accounts.map((account) => (
        <button
          key={account.id}
          onClick={() => onSelect(account.id)}
          className={cn(
            "flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium transition-colors border",
            selectedId === account.id
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
          )}
        >
          <span
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold",
              selectedId === account.id
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-600"
            )}
          >
            {account.name[0]?.toUpperCase()}
          </span>
          {account.name}
        </button>
      ))}
    </div>
  );
}
