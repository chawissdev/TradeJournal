import test from "node:test";
import assert from "node:assert/strict";
import { calcPnL } from "./calc.ts";

const round2 = (value) => Math.round(value * 100) / 100;

test("calculates PnL for a long position from asset quantity", () => {
  assert.equal(
    calcPnL({ side: "LONG", entry: 100, exit: 110, size: 10, leverage: 10 }),
    100,
  );
});

test("calculates PnL for a short position from asset quantity", () => {
  assert.equal(
    calcPnL({ side: "SHORT", entry: 100, exit: 90, size: 10, leverage: 5 }),
    100,
  );
});

test("matches exchange realized PnL when fees are provided", () => {
  const pnl = calcPnL({
    side: "SHORT",
    entry: 0.20995,
    exit: 0.20043,
    size: 3416,
    leverage: 3,
    fees: 0.38032,
  });

  assert.equal(round2(pnl), 32.14);
});