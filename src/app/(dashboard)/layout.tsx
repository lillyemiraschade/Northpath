import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/accounts", label: "Accounts" },
  { href: "/dashboard/compose", label: "Compose" },
  { href: "/dashboard/schedule", label: "Schedule" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/calendar", label: "Calendar" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-white p-6 flex flex-col">
        <Link href="/dashboard" className="text-xl font-bold text-blue-600 mb-8">
          Northpath
        </Link>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50 p-8">{children}</main>
    </div>
  );
}
