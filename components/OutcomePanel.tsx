import type { OutcomeMetrics, TradeOutcome } from "@/lib/dashboardMetrics";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";

const outcomeClass: Record<TradeOutcome, string> = {
  TP: "bg-success-50 text-success-700 border-success-500/30",
  SL: "bg-danger-50 text-danger-700 border-danger-500/30",
  SP: "bg-brand-50 text-brand-700 border-brand-200",
};

export default function OutcomePanel({ outcomes }: { outcomes: OutcomeMetrics[] }) {
  return (
    <section className="bg-white rounded-xl border border-ink-300/40 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-ink-900">Outcome Summary</h3>
        <span className="text-xs text-ink-500">TP / SL / SP</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {outcomes.map((item) => {
          const positive = item.pnl > 0;
          const negative = item.pnl < 0;

          return (
            <div key={item.outcome} className="rounded-xl bg-surface-muted p-4">
              <div className="flex items-center justify-between mb-4">
                <span className={cn("rounded-md border px-2 py-1 text-xs font-semibold", outcomeClass[item.outcome])}>
                  {item.outcome}
                </span>
                <span className="text-xs text-ink-500">{item.trades} trades</span>
              </div>

              <div className={cn(
                "text-2xl font-semibold tracking-tight",
                positive && "text-success-700",
                negative && "text-danger-700",
                !positive && !negative && "text-ink-900",
              )}>
                {formatCurrency(item.pnl)}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-ink-500">
                <span>Win rate</span>
                <span className="font-medium text-ink-700">{formatPercent(item.winRate)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
