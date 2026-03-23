"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PenSquare,
  FileText,
  BarChart3,
  CalendarDays,
  Users,
  ChevronDown,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import type { Account } from "@/types";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/compose", label: "Compose", icon: PenSquare },
  { href: "/dashboard/schedule", label: "Posts", icon: FileText },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((data) => setAccounts(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Store selected account in sessionStorage so all pages can read it
  useEffect(() => {
    if (selectedAccount) {
      sessionStorage.setItem("northpath_account", selectedAccount);
    } else {
      sessionStorage.removeItem("northpath_account");
    }
    window.dispatchEvent(new Event("account-changed"));
  }, [selectedAccount]);

  const selected = accounts.find((a) => a.id === selectedAccount);

  return (
    <aside className="w-64 border-r bg-white flex flex-col">
      <div className="p-6 pb-4">
        <Link href="/dashboard" className="text-xl font-bold text-blue-600">
          Northpath
        </Link>
      </div>

      {/* Account switcher dropdown */}
      <div className="px-3 mb-4 relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex w-full items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              {selected ? selected.name[0]?.toUpperCase() : "A"}
            </span>
            <span className="truncate">
              {selected ? selected.name : "All Accounts"}
            </span>
          </div>
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-gray-400 transition-transform", dropdownOpen && "rotate-180")} />
        </button>
        {dropdownOpen && (
          <div className="absolute left-3 right-3 mt-1 rounded-md border bg-white shadow-lg py-1 z-50">
            <button
              onClick={() => { setSelectedAccount(null); setDropdownOpen(false); }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50",
                selectedAccount === null && "bg-blue-50 text-blue-700 font-medium"
              )}
            >
              All Accounts
            </button>
            {accounts.map((account) => (
              <button
                key={account.id}
                onClick={() => { setSelectedAccount(account.id); setDropdownOpen(false); }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50",
                  selectedAccount === account.id && "bg-blue-50 text-blue-700 font-medium"
                )}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  {account.name[0]?.toUpperCase()}
                </span>
                <span className="truncate">{account.name}</span>
              </button>
            ))}
            {accounts.length === 0 && (
              <p className="px-3 py-2 text-xs text-gray-400">No accounts connected</p>
            )}
            <div className="border-t mt-1 pt-1">
              <a
                href="/api/auth/linkedin/connect"
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium"
              >
                <Plus className="h-4 w-4" />
                Add Account
              </a>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Accounts management at bottom */}
      <div className="px-3 pb-4">
        <Link
          href="/dashboard/accounts"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/dashboard/accounts"
              ? "bg-blue-50 text-blue-700"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <Users className="h-4 w-4" />
          Manage Accounts
        </Link>
      </div>
    </aside>
  );
}
