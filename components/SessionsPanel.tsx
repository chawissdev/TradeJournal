"use client";
import { Globe } from "lucide-react";

type Session = {
  name: string;
  zone: string;
  time: string;
  flag: string;
  profitChange: number;
  trades: number;
  winRate: number;
};

const sessions: Session[] = [
  { name: "London",   zone: "GMT +0", time: "08:01 AM", flag: "🇬🇧", profitChange: 12.23, trades: 8, winRate: 85.71 },
  { name: "New York", zone: "GMT +2", time: "12:01 PM", flag: "🇺🇸", profitChange: 12.23, trades: 8, winRate: 85.71 },
  { name: "Asia",     zone: "GMT +2", time: "18:01 PM", flag: "🇯🇵", profitChange: 12.23, trades: 8, winRate: 85.71 },
  { name: "Outside of Sessions", zone: "No Time zone", time: "", flag: "", profitChange: 12.23, trades: 8, winRate: 85.71 },
];

export default function SessionsPanel() {
  return (
    <div className="bg-white rounded-xl border border-ink-300/40 p-5">
      <h3 className="text-base font-semibold text-ink-900 mb-4">Sessions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {sessions.map((s) => (
          <div key={s.name} className="rounded-xl bg-surface-muted p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{s.flag || <Globe size={18} className="text-ink-500" />}</span>
                <div>
                  <div className="text-sm font-medium text-ink-900">{s.name}</div>
                  <div className="text-[11px] text-ink-500">{s.zone}</div>
                </div>
              </div>
              {s.time && (
                <div className="text-xs font-medium bg-white border border-ink-300/40 rounded-md px-2 py-1">
                  {s.time}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-ink-500 mb-1">
              <span>Profit</span>
              <span className="text-success-700 bg-success-50 rounded-md px-1.5 py-0.5 text-[11px] font-medium">
                ↑ {s.profitChange.toFixed(2)}%
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-ink-500 mt-2">
              <span>Total Trades</span>
              <span>Win Rate</span>
            </div>
            <div className="flex items-center justify-between font-semibold text-ink-900">
              <span>{s.trades}</span>
              <span>{s.winRate.toFixed(2)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
