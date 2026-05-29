import test from "node:test";
import assert from "node:assert/strict";
import { buildTradePayload } from "./tradePayload.js";

const formData = (entries) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.set(key, String(value));
  return data;
};

test("builds a trade payload with manual holding duration", () => {
  const payload = buildTradePayload(formData({
    symbol: "xlmusdt",
    side: "SHORT",
    outcome: "SP",
    leverage: "3",
    size: "3416",
    entry: "0.20995",
    exit: "0.20043",
    fees: "0.38032",
    holding_duration: "7h 50m",
    plan: "range short",
    notes: "closed manually",
  }));

  assert.equal(payload.symbol, "XLMUSDT");
  assert.equal(payload.side, "SHORT");
  assert.equal(payload.outcome, "SP");
  assert.equal(payload.holding_duration, "7h 50m");
  assert.equal(Math.round(Number(payload.pnl) * 100) / 100, 32.14);
});

test("normalizes blank optional edit fields to null", () => {
  const payload = buildTradePayload(formData({
    symbol: "btc",
    side: "LONG",
    outcome: "",
    leverage: "1",
    size: "2",
    entry: "100",
    exit: "",
    fees: "",
    holding_duration: "",
    plan: "",
    notes: "",
  }));

  assert.equal(payload.outcome, null);
  assert.equal(payload.exit, null);
  assert.equal(payload.pnl, null);
  assert.equal(payload.holding_duration, null);
  assert.equal(payload.plan, null);
  assert.equal(payload.notes, null);
});

test("keeps only secure TradingView chart links", () => {
  const valid = buildTradePayload(formData({
    symbol: "btc",
    side: "LONG",
    size: "1",
    entry: "100",
    chart_url: " https://www.tradingview.com/x/toWxfGVv/ ",
  }));

  assert.equal(valid.chart_url, "https://www.tradingview.com/x/toWxfGVv/");

  const insecure = buildTradePayload(formData({
    symbol: "btc",
    side: "LONG",
    size: "1",
    entry: "100",
    chart_url: "http://www.tradingview.com/x/toWxfGVv/",
  }));

  assert.equal(insecure.chart_url, null);

  const script = buildTradePayload(formData({
    symbol: "btc",
    side: "LONG",
    size: "1",
    entry: "100",
    chart_url: "javascript:alert(1)",
  }));

  assert.equal(script.chart_url, null);
});
