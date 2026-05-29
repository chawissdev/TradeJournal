"use client";

import { useMemo, useState } from "react";
import TradeTable, { type TradeRow } from "../trades/TradeTable";

type SortKey = "date_desc" | "date_asc" | "pnl_desc" | "pnl_asc";

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "date_desc", label: "Date: newest first" },
  { value: "date_asc", label: "Date: oldest first" },
  { value: "pnl_desc", label: "PNL: high to low" },
  { value: "pnl_asc", label: "PNL: low to high" },
];

const pnlValue = (t: TradeRow) =>
  t.pnl === null || t.pnl === undefined ? Number.NEGATIVE_INFINITY : Number(t.pnl);

const dateValue = (t: TradeRow) => new Date(t.entry_at).getTime();

export default function HistoryView({ trades }: { trades: TradeRow[] }) {
  const [sort, setSort] = useState<SortKey>("date_desc");

  const sorted = useMemo(() => {
    const copy = [...trades];
    switch (sort) {
      case "date_asc":
        copy.sort((a, b) => dateValue(a) - dateValue(b));
        break;
      case "pnl_desc":
        copy.sort((a, b) => pnlValue(b) - pnlValue(a));
        break;
      case "pnl_asc":
        copy.sort((a, b) => pnlValue(a) - pnlValue(b));
        break;
      case "date_desc":
      default:
        copy.sort((a, b) => dateValue(b) - dateValue(a));
        break;
    }
    return copy;
  }, [trades, sort]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-ink-500">
          {trades.length} trade{trades.length === 1 ? "" : "s"}
        </span>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-ink-500">Sort by</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-9 rounded-lg border border-ink-300/40 bg-white px-3 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <TradeTable trades={sorted} />
    </div>
  );
}
