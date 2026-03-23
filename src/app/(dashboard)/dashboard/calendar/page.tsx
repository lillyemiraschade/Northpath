"use client";

import { useEffect, useState } from "react";
import CalendarView from "@/components/dashboard/calendar-view";
import AccountSwitcher from "@/components/dashboard/account-switcher";

interface Account {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export default function CalendarPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/accounts").then((r) => r.json()).then((data) => setAccounts(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Content Calendar</h1>

      <AccountSwitcher
        accounts={accounts}
        selectedId={selectedAccount}
        onSelect={setSelectedAccount}
      />

      <CalendarView selectedAccountId={selectedAccount} />
    </div>
  );
}
