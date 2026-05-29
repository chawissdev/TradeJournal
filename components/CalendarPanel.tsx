"use client";

import { useMemo } from "react";
import type { CalendarDay, WeekTotal } from "@/lib/dashboardMetrics";
import { cn, formatCurrency } from "@/lib/utils";

type Props = {
  monthLabel: string;
  startPad: number;
  days: CalendarDay[];
  weekTotals: WeekTotal[];
};

const signedCurrency = (value: number) => `${value > 0 ? "+" : ""}${formatCurrency(value)}`;

export default function CalendarPanel({ monthLabel, startPad, days, weekTotals }: Props) {
  const cells = useMemo(() => {
    const calendarCells: (CalendarDay | null)[] = Array.from({ length: startPad }, () => null);
    calendarCells.push(...days);
    while (calendarCells.length % 7 !== 0) calendarCells.push(null);
    return calendarCells;
  }, [days, startPad]);

  return (
    <section className="bg-white rounded-xl border border-ink-300/40 p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h3 className="text-base font-semibold text-ink-900">Calendar PNL</h3>
        <span className="text-sm font-medium text-ink-700">{monthLabel}</span>
      </div>

      <div className="overflow-x-auto pb-1 mb-4">
        <div
          className="grid min-w-[640px] gap-2"
          style={{ gridTemplateColumns: `repeat(${weekTotals.length}, minmax(0, 1fr))` }}
        >
          {weekTotals.map((week) => {
            const positive = week.value > 0;
            const negative = week.value < 0;

            return (
              <div
                key={week.label}
                className={cn(
                  "rounded-xl px-3 py-2.5 border",
                  positive && "bg-success-50 border-success-500/30",
                  negative && "bg-danger-50 border-danger-500/30",
                  !positive && !negative && "bg-surface-muted border-ink-300/40",
                )}
              >
                <div className="text-xs text-ink-500">{week.label}</div>
                <div className={cn(
                  "text-sm font-semibold",
                  positive && "text-success-700",
                  negative && "text-danger-700",
                  !positive && !negative && "text-ink-700",
                )}>
                  {signedCurrency(week.value)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-7 gap-1 text-[10px] uppercase tracking-wider text-ink-500 mb-1">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <span key={day}>{day}</span>)}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, index) => {
              if (day === null) return <div key={`blank-${index}`} />;

              const hasTrades = day.trades > 0;
              const positive = day.pnl > 0;
              const negative = day.pnl < 0;

              return (
                <div
                  key={day.date}
                  className={cn(
                    "rounded-lg p-2 min-h-[72px] border text-[11px]",
                    hasTrades && positive && "bg-success-50 border-success-500/30",
                    hasTrades && negative && "bg-danger-50 border-danger-500/30",
                    hasTrades && !positive && !negative && "bg-brand-50 border-brand-200",
                    !hasTrades && "bg-surface-subtle border-ink-300/30",
                  )}
                >
                  <div className="text-ink-700 text-[10px] font-medium">
                    {String(day.date).padStart(2, "0")}
                  </div>
                  {hasTrades && (
                    <>
                      <div className={cn(
                        "font-semibold mt-1",
                        positive && "text-success-700",
                        negative && "text-danger-700",
                        !positive && !negative && "text-brand-700",
                      )}>
                        {signedCurrency(day.pnl)}
                      </div>
                      <div className="text-ink-500 text-[10px]">{day.trades} trades</div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
