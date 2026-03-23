"use client";

import { useSelectedAccount } from "@/hooks/use-selected-account";
import CalendarView from "@/components/dashboard/calendar-view";

export default function CalendarPage() {
  const selectedAccount = useSelectedAccount();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Content Calendar</h1>
      <CalendarView selectedAccountId={selectedAccount} />
    </div>
  );
}
