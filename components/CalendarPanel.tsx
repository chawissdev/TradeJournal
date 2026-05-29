"use client";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Camera, DollarSign, Percent } from "lucide-react";
import { cn } from "@/lib/utils";

type DayData = { date: number; pnl?: number; trades?: number; r?: number };

// Mock data — replace with real query from /api/trades grouped by day
const sept2023: Record<number, DayData> = {
  10: { date: 10, pnl: 12,  trades: 18, r: 5 },
  14: { date: 14, pnl: 12,  trades: 18, r: 5 },
  18: { date: 18, pnl: 12,  trades: 18, r: 5 },
  21: { date: 21, pnl: -24, trades: 10, r: -2 },
  22: { date: 22, pnl: -48, trades: 14, r: -3 },
};

const weekTotals = [
  { label: "1st Week", value: 0 },
  { label: "2nd Week", value: 24 },
  { label: "3rd Week", value: 12 },
  { label: "4th Week", value: -72 },
  { label: "5th Week", value: 0 },
];

export default function CalendarPanel() {
  const [mode, setMode] = useState<"dollar" | "percent">("dollar");

  // Sept 2023: Sept 1 = Friday → days array padded
  const days = useMemo(() => {
    const arr: (number | null)[] = [];
    const startWeekdayMon0 = 4; // Sept 1 2023 is Friday → index 4 (Mon=0)
    for (let i = 0; i < startWeekdayMon0; i++) arr.push(null);
    for (let d = 1; d <= 30; d++) arr.push(d);
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, []);

  return (
    <div className="bg-white rounded-xl border border-ink-300/40 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button className="w-8 h-8 grid place-items-center rounded-lg bg-surface-muted hover:bg-ink-300/20">
            <ChevronLeft size={16} />
          </button>
          <span className="font-medium text-ink-900">September 2023</span>
          <button className="w-8 h-8 grid place-items-center rounded-lg bg-surface-muted hover:bg-ink-300/20">
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg overflow-hidden border border-ink-300/40">
            <button
              onClick={() => setMode("dollar")}
              className={cn(
                "px-3 py-1.5 text-sm",
                mode === "dollar" ? "bg-brand-600 text-white" : "bg-white text-ink-700"
              )}
            >
              <DollarSign size={14} />
            </button>
            <button
              onClick={() => setMode("percent")}
              className={cn(
                "px-3 py-1.5 text-sm",
                mode === "percent" ? "bg-brand-600 text-white" : "bg-white text-ink-700"
              )}
            >
              <Percent size={14} />
            </button>
          </div>
          <button className="w-9 h-9 grid place-items-center rounded-lg border border-ink-300/40 bg-white hover:bg-surface-muted">
            <Camera size={16} className="text-ink-700" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-4">
        {weekTotals.map((w) => {
          const positive = w.value > 0;
          const negative = w.value < 0;
          return (
            <div
              key={w.label}
              className={cn(
                "rounded-xl px-3 py-2.5 border",
                positive && "bg-success-50 border-success-500/30",
                negative && "bg-danger-50 border-danger-500/30",
                !positive && !negative && "bg-surface-muted border-ink-300/40"
              )}
            >
              <div className="text-xs text-ink-500">{w.label}</div>
              <div className={cn(
                "text-sm font-semibold",
                positive && "text-success-700",
                negative && "text-danger-700",
              )}>
                {w.value > 0 && "+"}${w.value.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-7 gap-1 text-[10px] uppercase tracking-wider text-ink-500 mb-1">
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => <span key={d}>{d}</span>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          if (d === null) return <div key={i} />;
          const data = sept2023[d];
          const positive = data && (data.pnl ?? 0) > 0;
          const negative = data && (data.pnl ?? 0) < 0;
          return (
            <div
              key={i}
              className={cn(
                "rounded-lg p-2 min-h-[68px] border text-[11px]",
                positive && "bg-success-50 border-success-500/30",
                negative && "bg-danger-50 border-danger-500/30",
                !data && "bg-surface-subtle border-ink-300/30"
              )}
            >
              <div className="text-ink-700 text-[10px] font-medium">{String(d).padStart(2, "0")}</div>
              {data && (
                <>
                  <div className={cn(
                    "font-semibold mt-1",
                    positive ? "text-success-700" : "text-danger-700"
                  )}>
                    {(data.pnl ?? 0) > 0 ? "+" : ""}{(data.pnl ?? 0).toFixed(2)} $
                  </div>
                  <div className="text-ink-500 text-[10px]">{data.trades} trades</div>
                  {data.r !== undefined && (
                    <div className="inline-block text-[9px] mt-0.5 bg-white/60 rounded px-1">{data.r} R</div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
