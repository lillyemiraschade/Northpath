"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  PenSquare,
  Clock,
  BarChart3,
  CalendarDays,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/accounts", label: "Accounts", icon: Users },
  { href: "/dashboard/compose", label: "Compose", icon: PenSquare },
  { href: "/dashboard/schedule", label: "Schedule", icon: Clock },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-64 border-r bg-white flex flex-col">
      <div className="p-6">
        <Link href="/dashboard" className="text-xl font-bold text-blue-600">
          Northpath
        </Link>
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

      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
            {session?.user?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">
              {session?.user?.name ?? "User"}
            </p>
            <p className="truncate text-xs text-gray-500">
              {session?.user?.email}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
