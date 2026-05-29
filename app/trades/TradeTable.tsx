"use client";

import { Check, Image as ImageIcon, Pencil, Trash2, X } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteTrade, updateTrade } from "./actions";
import { calcPnL } from "@/lib/calc";
import { cn, formatCurrency } from "@/lib/utils";

export type TradeOutcome = "TP" | "SL" | "SP";

export type TradeRow = {
  id: string;
  symbol: string;
  side: "LONG" | "SHORT";
  outcome: TradeOutcome | null;
  leverage: number | null;
  size: number;
  entry: number;
  exit: number | null;
  fees: number | null;
  pnl: number | null;
  holding_duration: string | null;
  chart_url: string | null;
  plan: string | null;
  notes: string | null;
  entry_at: string;
};

const inputClass =
  "w-full h-9 px-2 rounded-lg bg-white border border-ink-300/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500";
const labelClass = "text-xs font-medium text-ink-500 mb-1 block";
const outcomeOptions = ["TP", "SL", "SP"] as const;

const outcomeClass: Record<TradeOutcome, string> = {
  TP: "bg-success-50 text-success-700",
  SL: "bg-danger-50 text-danger-700",
  SP: "bg-brand-50 text-brand-700",
};

const formatTradeDate = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", { timeZone: "UTC" });

export default function TradeTable({ trades }: { trades: TradeRow[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
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
              <Th>Outcome</Th>
              <Th>Lev</Th>
              <Th>Size</Th>
              <Th>Entry</Th>
              <Th>Exit</Th>
              <Th>PNL $</Th>
              <Th>Chart</Th>
              <Th>Plan</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <TradeRows
                key={trade.id}
                trade={trade}
                editing={editingId === trade.id}
                onEdit={() => setEditingId((current) => (current === trade.id ? null : trade.id))}
                onCancel={() => setEditingId(null)}
                onSaved={() => setEditingId(null)}
                onDelete={() => startTransition(() => {
                  void deleteTrade(trade.id);
                })}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TradeRows({
  trade,
  editing,
  onEdit,
  onCancel,
  onSaved,
  onDelete,
}: {
  trade: TradeRow;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSaved: () => void;
  onDelete: () => void;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  return (
    <>
      <tr className="border-t border-ink-300/30 hover:bg-surface-subtle">
        <Td>
          <div className="flex items-center gap-2">
            <span>{formatTradeDate(trade.entry_at)}</span>
            {trade.holding_duration && (
              <span
                title={`Holding duration: ${trade.holding_duration}`}
                className="inline-flex h-5 items-center rounded border border-brand-200 bg-brand-50 px-1.5 text-[11px] font-semibold leading-none text-brand-700"
              >
                {trade.holding_duration}
              </span>
            )}
          </div>
        </Td>
        <Td className="font-medium text-ink-900">{trade.symbol}</Td>
        <Td>
          <span className={cn(
            "text-[11px] font-semibold px-2 py-0.5 rounded",
            trade.side === "LONG"
              ? "bg-success-50 text-success-700"
              : "bg-danger-50 text-danger-700"
          )}>
            {trade.side}
          </span>
        </Td>
        <Td>
          {trade.outcome ? (
            <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded", outcomeClass[trade.outcome])}>
              {trade.outcome}
            </span>
          ) : (
            <span className="text-ink-500">-</span>
          )}
        </Td>
        <Td>{trade.leverage ? `${Number(trade.leverage)}x` : "-"}</Td>
        <Td>{Number(trade.size)}</Td>
        <Td>{Number(trade.entry)}</Td>
        <Td>{trade.exit !== null ? Number(trade.exit) : "-"}</Td>
        <Td className={cn(
          "font-semibold",
          trade.pnl === null && "text-ink-500",
          trade.pnl !== null && Number(trade.pnl) >= 0 && "text-success-700",
          trade.pnl !== null && Number(trade.pnl) < 0 && "text-danger-700"
        )}>
          {trade.pnl !== null ? formatCurrency(Number(trade.pnl)) : "-"}
        </Td>
        <Td>
          {trade.chart_url ? (
            <a
              href={trade.chart_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-brand-700 hover:text-brand-800 hover:underline"
              title={trade.chart_url}
            >
              <ImageIcon size={14} /> View
            </a>
          ) : (
            <span className="text-ink-500">-</span>
          )}
        </Td>
        <Td className="max-w-[200px] truncate text-ink-500" title={trade.plan ?? ""}>
          {trade.plan ?? "-"}
        </Td>
        <Td>
          <div className="flex items-center gap-1">
            {confirmingDelete ? (
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-danger-700">Delete?</span>
                <button
                  onClick={() => {
                    setConfirmingDelete(false);
                    onDelete();
                  }}
                  className="rounded bg-danger-500 px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-danger-600"
                  aria-label="Confirm delete trade"
                  title="Confirm delete"
                >
                  Yes
                </button>
                <button
                  onClick={() => setConfirmingDelete(false)}
                  className="rounded border border-ink-300/40 px-2 py-0.5 text-[11px] font-semibold text-ink-700 hover:bg-surface-muted"
                  aria-label="Cancel delete"
                  title="Cancel"
                >
                  No
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={onEdit}
                  className="text-ink-500 hover:text-brand-700 p-1"
                  aria-label="Edit trade"
                  title="Edit trade"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setConfirmingDelete(true)}
                  className="text-ink-500 hover:text-danger-700 p-1"
                  aria-label="Delete trade"
                  title="Delete trade"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        </Td>
      </tr>
      {editing && (
        <EditTradeRow trade={trade} onCancel={onCancel} onSaved={onSaved} />
      )}
    </>
  );
}

function EditTradeRow({ trade, onCancel, onSaved }: { trade: TradeRow; onCancel: () => void; onSaved: () => void }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [side, setSide] = useState<"LONG" | "SHORT">(trade.side);
  const [outcome, setOutcome] = useState<TradeOutcome | "">(trade.outcome ?? "");
  const [entry, setEntry] = useState(String(trade.entry));
  const [exit, setExit] = useState(trade.exit === null ? "" : String(trade.exit));
  const [size, setSize] = useState(String(trade.size));
  const [fees, setFees] = useState(trade.fees === null ? "0" : String(trade.fees));

  const previewPnl = entry && exit && size
    ? calcPnL({ side, entry: Number(entry), exit: Number(exit), size: Number(size), fees: Number(fees || 0) })
    : null;

  const onSubmit = (formData: FormData) => {
    formData.set("id", trade.id);
    formData.set("side", side);
    formData.set("outcome", outcome);
    setError(null);

    startTransition(async () => {
      const res = await updateTrade(formData);
      if (!res?.ok) setError(res?.error ?? "Failed to update");
      else onSaved();
    });
  };

  return (
    <tr className="border-t border-brand-200 bg-brand-50/40">
      <td colSpan={12} className="p-4">
        <form action={onSubmit} className="space-y-3">
          <input type="hidden" name="id" value={trade.id} />
          <input type="hidden" name="side" value={side} />
          <input type="hidden" name="outcome" value={outcome} />

          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
            <Field label="Symbol">
              <input name="symbol" required defaultValue={trade.symbol} className={inputClass} />
            </Field>
            <Field label="Leverage">
              <input name="leverage" type="number" step="0.1" min="0" defaultValue={trade.leverage ?? 1} className={inputClass} />
            </Field>
            <Field label="Qty / Volume">
              <input name="size" required type="number" step="any" min="0" value={size} onChange={(e) => setSize(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Entry">
              <input name="entry" required type="number" step="any" min="0" value={entry} onChange={(e) => setEntry(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Exit">
              <input name="exit" type="number" step="any" min="0" value={exit} onChange={(e) => setExit(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Fees">
              <input name="fees" type="number" step="any" min="0" value={fees} onChange={(e) => setFees(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Duration">
              <input name="holding_duration" defaultValue={trade.holding_duration ?? ""} placeholder="7h 50m" className={inputClass} />
            </Field>
            <Field label="Auto PNL $">
              <div className={cn(
                "flex h-9 items-center rounded-lg border border-ink-300/40 bg-white px-2 text-sm font-semibold",
                previewPnl === null && "text-ink-500",
                previewPnl !== null && previewPnl >= 0 && "text-success-700",
                previewPnl !== null && previewPnl < 0 && "text-danger-700"
              )}>
                {previewPnl !== null ? `${previewPnl >= 0 ? "+" : ""}$${previewPnl.toFixed(2)}` : "$0.00"}
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_1fr] gap-3">
            <div>
              <label className={labelClass}>Side</label>
              <div className="flex h-9 gap-1 rounded-lg bg-white p-1 border border-ink-300/40">
                {(["LONG", "SHORT"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSide(option)}
                    className={cn(
                      "flex-1 rounded-md text-xs font-semibold transition",
                      side === option && option === "LONG" && "bg-success-500 text-white",
                      side === option && option === "SHORT" && "bg-danger-500 text-white",
                      side !== option && "text-ink-500 hover:text-ink-700"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Outcome</label>
              <div className="flex h-9 gap-1 rounded-lg bg-white p-1 border border-ink-300/40">
                {outcomeOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setOutcome(outcome === option ? "" : option)}
                    className={cn(
                      "flex-1 rounded-md text-xs font-semibold transition",
                      outcome === option && option === "TP" && "bg-success-500 text-white",
                      outcome === option && option === "SL" && "bg-danger-500 text-white",
                      outcome === option && option === "SP" && "bg-brand-600 text-white",
                      outcome !== option && "text-ink-500 hover:text-ink-700"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end gap-2 justify-end">
              <button type="button" onClick={onCancel} className="h-9 px-3 rounded-lg border border-ink-300/40 bg-white text-sm text-ink-700 hover:bg-surface-muted">
                <X size={15} className="inline mr-1" /> Cancel
              </button>
              <button type="submit" disabled={pending} className="h-9 px-4 rounded-lg bg-brand-600 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
                <Check size={15} className="inline mr-1" /> {pending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          <Field label="Chart link (TradingView)">
            <input
              name="chart_url"
              type="url"
              inputMode="url"
              defaultValue={trade.chart_url ?? ""}
              placeholder="https://www.tradingview.com/x/toWxfGVv/"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <Field label="Plan">
              <textarea name="plan" rows={2} defaultValue={trade.plan ?? ""} className={cn(inputClass, "h-auto py-2 resize-y")} />
            </Field>
            <Field label="Notes">
              <textarea name="notes" rows={2} defaultValue={trade.notes ?? ""} className={cn(inputClass, "h-auto py-2 resize-y")} />
            </Field>
          </div>

          {error && (
            <div className="text-sm text-danger-700 bg-danger-50 border border-danger-500/20 rounded-lg p-3">
              {error}
            </div>
          )}
        </form>
      </td>
    </tr>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">{children}</th>;
}
function Td({ children, className, title }: { children?: React.ReactNode; className?: string; title?: string }) {
  return <td title={title} className={cn("px-3 py-2.5 whitespace-nowrap", className)}>{children}</td>;
}
