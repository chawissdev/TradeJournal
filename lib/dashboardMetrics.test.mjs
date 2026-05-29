import test from "node:test";
import assert from "node:assert/strict";
import { buildDashboardMetrics } from "./dashboardMetrics.ts";

const round2 = (value) => Math.round(value * 100) / 100;

const trades = [
  { id: "1", outcome: "SP", pnl: 32.14, entry_at: "2026-05-29T01:34:10.000Z" },
  { id: "2", outcome: "SL", pnl: -10.14, entry_at: "2026-05-29T04:00:00.000Z" },
  { id: "3", outcome: "TP", pnl: 50, entry_at: "2026-05-28T12:00:00.000Z" },
  { id: "4", outcome: null, pnl: null, entry_at: "2026-05-27T12:00:00.000Z" },
];

test("builds dashboard metrics from persisted trades", () => {
  const metrics = buildDashboardMetrics(trades, new Date("2026-05-29T12:00:00.000Z"));

  assert.equal(metrics.totalTrades, 4);
  assert.equal(round2(metrics.netPnl), 72);
  assert.equal(round2(metrics.winRate), 66.67);
  assert.equal(round2(metrics.avgWin), 41.07);
  assert.equal(round2(metrics.avgLoss), -10.14);
  assert.equal(metrics.pnlSeries.length, 30);
  assert.equal(round2(metrics.pnlSeries.at(-1).v), 72);

  assert.deepEqual(metrics.outcomes.map(({ outcome, trades, pnl }) => ({ outcome, trades, pnl: round2(pnl) })), [
    { outcome: "TP", trades: 1, pnl: 50 },
    { outcome: "SL", trades: 1, pnl: -10.14 },
    { outcome: "SP", trades: 1, pnl: 32.14 },
  ]);

  const day29 = metrics.calendar.days.find((day) => day.date === 29);
  assert.equal(day29.trades, 2);
  assert.equal(round2(day29.pnl), 22);
  assert.equal(metrics.calendar.monthLabel, "May 2026");
  assert.equal(round2(metrics.calendar.weekTotals.reduce((sum, week) => sum + week.value, 0)), 72);
});

test("returns empty dashboard metrics without mock data", () => {
  const metrics = buildDashboardMetrics([], new Date("2026-05-29T12:00:00.000Z"));

  assert.equal(metrics.totalTrades, 0);
  assert.equal(metrics.netPnl, 0);
  assert.equal(metrics.winRate, 0);
  assert.equal(metrics.avgWin, 0);
  assert.equal(metrics.avgLoss, 0);
  assert.equal(metrics.outcomes.every((item) => item.trades === 0 && item.pnl === 0), true);
  assert.equal(metrics.calendar.days.every((day) => day.trades === 0 && day.pnl === 0), true);
  assert.equal(metrics.pnlSeries.every((point) => point.v === 0), true);
});
