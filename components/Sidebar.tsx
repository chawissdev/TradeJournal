"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LineChart, Calendar, ListChecks, FileBarChart, Target, Users } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

const items = [
  { icon: LayoutDashboard, label: "Dashboard",    href: "/" },
  { icon: LineChart,       label: "Back Testing", href: "/backtesting" },
  { icon: Calendar,        label: "Daily Journal", href: "/journal" },
  { icon: ListChecks,      label: "Trade Log",    href: "/trades" },
  { icon: FileBarChart,    label: "Reports",      href: "/reports" },
  { icon: Target,          label: "Track Record", href: "/track-record" },
  { icon: Users,           label: "Affiliate Manager", href: "/affiliates" },
];

export default function Sidebar({ balance = 315000.12 }: { balance?: number }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-ink-300/40 h-screen sticky top-0 flex flex-col">
      <div className="p-5 border-b border-ink-300/40 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-brand-600 grid place-items-center text-white text-sm font-bold">T</div>
        <span className="font-semibold text-ink-900">TradeJourney</span>
      </div>

      <div className="m-4 rounded-xl bg-surface-muted px-4 py-3">
        <div className="text-xl font-semibold tracking-tight text-ink-900">
          {formatCurrency(balance)}
        </div>
        <div className="text-xs text-ink-500">Account balance</div>
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
                  : "text-ink-700 hover:bg-surface-muted"
              )}
            >
              <Icon size={18} className={active ? "text-brand-600" : "text-ink-500"} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 text-xs text-ink-500 border-t border-ink-300/40">
        Video tutorial
      </div>
    </aside>
  );
}
