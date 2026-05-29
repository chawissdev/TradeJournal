"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Check,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Pencil,
  X,
} from "lucide-react";
import { updateAccountBalance } from "@/app/actions";
import { cn, formatCurrency } from "@/lib/utils";

const items = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Calendar, label: "Trade History", href: "/history" },
  { icon: ListChecks, label: "Trade Log", href: "/trades" },
];

export default function Sidebar({ balance = 0 }: { balance?: number }) {
  const pathname = usePathname();
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [balanceValue, setBalanceValue] = useState(balance.toFixed(2));
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!isEditingBalance) setBalanceValue(balance.toFixed(2));
  }, [balance, isEditingBalance]);

  const closeBalanceEdit = () => {
    setBalanceError(null);
    setBalanceValue(balance.toFixed(2));
    setIsEditingBalance(false);
  };

  const onBalanceSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setBalanceError(null);

    startTransition(async () => {
      const result = await updateAccountBalance(formData);
      if (!result?.ok) {
        setBalanceError(result?.error ?? "Could not update balance");
        return;
      }
      setIsEditingBalance(false);
    });
  };

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-ink-300/40 h-screen sticky top-0 flex flex-col">
      <div className="p-5 border-b border-ink-300/40 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-brand-600 grid place-items-center text-white text-sm font-bold">T</div>
        <span className="font-semibold text-ink-900">TradeJourney</span>
      </div>

      <div className="m-4 rounded-xl bg-surface-muted px-4 py-3">
        {isEditingBalance ? (
          <form onSubmit={onBalanceSubmit} className="space-y-2">
            <div className="flex items-center gap-1">
              <input
                name="balance"
                type="number"
                min="0"
                step="0.01"
                value={balanceValue}
                onChange={(event) => setBalanceValue(event.target.value)}
                className="min-w-0 flex-1 h-9 rounded-lg border border-ink-300/40 bg-white px-2 text-sm font-semibold text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                aria-label="Account balance"
                disabled={pending}
              />
              <button
                type="submit"
                disabled={pending}
                className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-60"
                aria-label="Save account balance"
                title="Save account balance"
              >
                <Check size={16} />
              </button>
              <button
                type="button"
                onClick={closeBalanceEdit}
                disabled={pending}
                className="grid h-9 w-9 place-items-center rounded-lg border border-ink-300/40 bg-white text-ink-700 hover:bg-surface-muted disabled:opacity-60"
                aria-label="Cancel account balance edit"
                title="Cancel"
              >
                <X size={16} />
              </button>
            </div>
            {balanceError && <div className="text-xs text-danger-700">{balanceError}</div>}
          </form>
        ) : (
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-xl font-semibold tracking-tight text-ink-900 truncate">
                {formatCurrency(balance)}
              </div>
              <div className="text-xs text-ink-500">Account balance</div>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingBalance(true)}
              className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-500 hover:bg-white hover:text-brand-700"
              aria-label="Edit account balance"
              title="Edit account balance"
            >
              <Pencil size={14} />
            </button>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {items.map(({ icon: Icon, label, href }) => {
          const active = pathname === href || (href !== "/" && pathname?.startsWith(href));
          return (
            <Link
              key={label}
              href={href}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition",
                active
                  ? "bg-brand-50 text-brand-700 font-medium"
                  : "text-ink-700 hover:bg-surface-muted",
              )}
            >
              <Icon size={18} className={active ? "text-brand-600" : "text-ink-500"} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-ink-300/40">
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink-700 transition hover:bg-surface-muted"
          >
            <LogOut size={18} className="text-ink-500" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
