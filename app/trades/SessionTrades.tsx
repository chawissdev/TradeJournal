"use client";

import Link from "next/link";
import { useState } from "react";
import TradeForm from "./TradeForm";
import TradeTable, { type TradeRow } from "./TradeTable";

export default function SessionTrades() {
  // Only trades created during this page session are shown here.
  const [trades, setTrades] = useState<TradeRow[]>([]);

  const handleCreated = (trade: TradeRow) => {
    setTrades((current) => [trade, ...current]);
  };

  return (
    <div className="space-y-6">
      <TradeForm onCreated={handleCreated} />

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-ink-700">
          Added this session{trades.length > 0 ? ` (${trades.length})` : ""}
        </h2>
        <Link href="/history" className="text-sm text-brand-700 hover:underline">
          View all trades →
        </Link>
      </div>

      {trades.length === 0 ? (
        <div className="bg-white rounded-xl border border-ink-300/40 p-10 text-center text-sm text-ink-500">
          Trades you add now will appear here. See all past trades in{" "}
          <Link href="/history" className="text-brand-700 hover:underline">
            Trade History
          </Link>
          .
        </div>
      ) : (
        <TradeTable trades={trades} />
      )}
    </div>
  );
}
