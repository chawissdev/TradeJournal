"use client";

import { useState, useTransition } from "react";
import { addTrade } from "./actions";
import { calcPnL } from "@/lib/calc";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full h-10 px-3 rounded-lg bg-white border border-ink-300/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500";

const labelClass = "text-xs font-medium text-ink-500 mb-1.5 block";

export default function TradeForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [side, setSide] = useState<"LONG" | "SHORT">("LONG");

  // Live PNL preview
  const [entry, setEntry] = useState<string>("");
  const [exit, setExit] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [fees, setFees] = useState<string>("0");

  const previewPnl =
    entry && exit && size
      ? calcPnL({
          side,
          entry: Number(entry),
          exit: Number(exit),
          size: Number(size),
          fees: Number(fees || 0),
        })
      : null;

  const onSubmit = (formData: FormData) => {
    formData.set("side", side);
    setError(null);
    startTransition(async () => {
      const res = await addTrade(formData);
      if (!res?.ok) setError(res?.error ?? "Failed to save");
      else {
        // Reset form
        (document.getElementById("trade-form") as HTMLFormElement)?.reset();
        setEntry(""); setExit(""); setSize(""); setFees("0");
      }
    });
  };

  return (
    <form
      id="trade-form"
      action={onSubmit}
      className="bg-white rounded-xl border border-ink-300/40 p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-ink-900">New Trade</h3>
        <div className="flex gap-1 bg-surface-muted rounded-lg p-1">
          {(["LONG", "SHORT"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSide(s)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition",
                side === s
                  ? s === "LONG"
                    ? "bg-success-500 text-white"
                    : "bg-danger-500 text-white"
                  : "text-ink-500 hover:text-ink-700"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Symbol</label>
          <input name="symbol" required placeholder="BTCUSDT" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Session</label>
          <select name="session" className={inputClass} defaultValue="">
            <option value="">—</option>
            <option value="LONDON">London</option>
            <option value="NEW_YORK">New York</option>
            <option value="ASIA">Asia</option>
            <option value="OUTSIDE">Outside</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Leverage</label>
          <input name="leverage" type="number" step="0.1" min="0" defaultValue="1" className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Size</label>
          <input
            name="size" required type="number" step="any" placeholder="0.0"
            value={size} onChange={(e) => setSize(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Entry</label>
          <input
            name="entry" required type="number" step="any" placeholder="0.0"
            value={entry} onChange={(e) => setEntry(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Exit</label>
          <input
            name="exit" type="number" step="any" placeholder="0.0"
            value={exit} onChange={(e) => setExit(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>TP — Take Profit</label>
          <input name="take_profit" type="number" step="any" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>SL — Stop Loss</label>
          <input name="stop_loss" type="number" step="any" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>SP — Stop Profit</label>
          <input name="stop_profit" type="number" step="any" className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Fees</label>
          <input
            name="fees" type="number" step="any" defaultValue="0"
            value={fees} onChange={(e) => setFees(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>
            PNL $ <span className="text-ink-300">(auto from entry/exit/size if blank)</span>
          </label>
          <input
            name="pnl" type="number" step="any"
            placeholder={previewPnl !== null ? `auto: ${previewPnl.toFixed(2)}` : "0.00"}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>PLAN — setup / thesis</label>
        <textarea
          name="plan" rows={3}
          placeholder="e.g. Break and retest of London high, target prior day VAH, invalidation below 65,200"
          className={cn(inputClass, "h-auto py-2 resize-y")}
        />
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          name="notes" rows={2}
          placeholder="post-trade reflection, screenshot, what went well / poorly"
          className={cn(inputClass, "h-auto py-2 resize-y")}
        />
      </div>

      {error && (
        <div className="text-sm text-danger-700 bg-danger-50 border border-danger-500/20 rounded-lg p-3">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-ink-300/30">
        <div className="text-xs text-ink-500">
          {previewPnl !== null && (
            <>
              Live PNL preview:{" "}
              <span className={previewPnl >= 0 ? "text-success-700 font-semibold" : "text-danger-700 font-semibold"}>
                {previewPnl >= 0 ? "+" : ""}${previewPnl.toFixed(2)}
              </span>
            </>
          )}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="px-5 h-10 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save trade"}
        </button>
      </div>
    </form>
  );
}
