import { calcPnL } from "../../lib/calc.ts";

const outcomes = new Set(["TP", "SL", "SP"]);
const sides = new Set(["LONG", "SHORT"]);

const field = (formData, key) => formData.get(key);

const textValue = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

const tradingViewHost = (host) =>
  host === "tradingview.com" || host.endsWith(".tradingview.com");

export const chartUrlValue = (value) => {
  const text = textValue(value);
  if (!text) return null;

  try {
    const url = new URL(text);
    if (url.protocol !== "https:" || !tradingViewHost(url.hostname.toLowerCase())) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
};

const numberValue = (formData, key, fallback = null) => {
  const value = field(formData, key);
  if (value === null || value === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

export function normalizeOutcome(value) {
  return outcomes.has(value) ? value : null;
}

export function normalizeSide(value) {
  return sides.has(value) ? value : "LONG";
}

export function buildTradePayload(formData) {
  const side = normalizeSide(String(field(formData, "side") ?? ""));
  const entry = numberValue(formData, "entry", 0);
  const exit = numberValue(formData, "exit", null);
  const size = numberValue(formData, "size", 0);
  const fees = numberValue(formData, "fees", 0) ?? 0;

  return {
    symbol: String(field(formData, "symbol") ?? "").trim().toUpperCase(),
    side,
    outcome: normalizeOutcome(String(field(formData, "outcome") ?? "")),
    leverage: numberValue(formData, "leverage", 1) ?? 1,
    size,
    entry,
    exit,
    pnl: exit !== null ? calcPnL({ side, entry, exit, size, fees }) : null,
    fees,
    holding_duration: textValue(field(formData, "holding_duration")),
    chart_url: chartUrlValue(field(formData, "chart_url")),
    plan: textValue(field(formData, "plan")),
    notes: textValue(field(formData, "notes")),
  };
}
