"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { deleteTrade } from "./actions";
import { cn, formatCurrency } from "@/lib/utils";

export type TradeRow = {
  id: string;
  symbol: string;
  side: "LONG" | "SHORT";
  leverage: number | null;
  size: number;
  entry: number;
  exit: number | null;
  take_profit: number | null;
  stop_loss: number | null;
  stop_profit: number | null;
  pnl: number | null;
  plan: string | null;
  entry_at: string;
};

export default function TradeTable({ trades }: { trades: TradeRow[] }) {
  const [, startTransition] = useTransition();

  if (trades.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-ink-300/40 p-10 text-center text-sm text-ink-500">
        No trades yet. Add your first one above.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-ink-300/40 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-ink-500 text-xs uppercase tracking-wide">
            <tr>
              <Th>Date</Th>
              <Th>Symbol</Th>
              <Th>Side</Th>
              <Th>Lev</Th>
              <Th>Size</Th>
              <Th>Entry</Th>
              <Th>Exit</Th>
              <Th>TP</Th>
              <Th>SL</Th>
              <Th>SP</Th>
              <Th>PNL $</Th>
              <Th>Plan</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t) => (
              <tr key={t.id} className="border-t border-ink-300/30 hover:bg-surface-subtle">
                <Td>{new Date(t.entry_at).toLocaleDateString("en-GB")}</Td>
                <Td className="font-medium text-ink-900">{t.symbol}</Td>
                <Td>
                  <span className={cn(
                    "text-[11px] font-semibold px-2 py-0.5 rounded",
                    t.side === "LONG"
                      ? "bg-success-50 text-success-700"
                      : "bg-danger-50 text-danger-700"
                  )}>
                    {t.side}
                  </span>
                </Td>
                <Td>{t.leverage ? `${Number(t.leverage)}x` : "—"}</Td>
                <Td>{Number(t.size)}</Td>
                <Td>{Number(t.entry)}</Td>
                <Td>{t.exit !== null ? Number(t.exit) : "—"}</Td>
                <Td className="text-success-700">{t.take_profit !== null ? Number(t.take_profit) : "—"}</Td>
                <Td className="text-danger-700">{t.stop_loss !== null ? Number(t.stop_loss) : "—"}</Td>
                <Td>{t.stop_profit !== null ? Number(t.stop_profit) : "—"}</Td>
                <Td className={cn(
                  "font-semibold",
                  t.pnl !== null && Number(t.pnl) >= 0 ? "text-success-700" : "text-danger-700"
                )}>
                  {t.pnl !== null ? formatCurrency(Number(t.pnl)) : "—"}
                </Td>
                <Td className="max-w-[200px] truncate text-ink-500" title={t.plan ?? ""}>
                  {t.plan ?? "—"}
                </Td>
                <Td>
                  <button
                    onClick={() => startTransition(() => deleteTrade(t.id))}
                    className="text-ink-500 hover:text-danger-700 p-1"
                    aria-label="Delete trade"
                  >
                    <Trash2 size={14} />
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-3 py-2.5 whitespace-nowrap", className)}>{children}</td>;
}
