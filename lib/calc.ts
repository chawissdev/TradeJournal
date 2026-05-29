// Pure functions for trade math — used by the form preview and the server action

export type Side = "LONG" | "SHORT";

/**
 * Calculates realized P&L in dollars.
 * pnl = (exit - entry) * size * (LONG ? 1 : -1) - fees
 *
 * Leverage doesn't change P&L directly — it changes margin used.
 * It's still stored so we can compute ROI / risk later.
 */
export function calcPnL({
  side,
  entry,
  exit,
  size,
  fees = 0,
}: {
  side: Side;
  entry: number;
  exit: number;
  size: number;
  fees?: number;
}): number {
  const direction = side === "LONG" ? 1 : -1;
  return (exit - entry) * size * direction - fees;
}

/**
 * R-multiple: how many "risk units" the trade won/lost.
 * Risk = |entry - stopLoss| * size
 */
export function calcRMultiple({
  side,
  entry,
  exit,
  stopLoss,
  size,
}: {
  side: Side;
  entry: number;
  exit: number;
  stopLoss: number;
  size: number;
}): number | null {
  const risk = Math.abs(entry - stopLoss) * size;
  if (risk === 0) return null;
  const pnl = calcPnL({ side, entry, exit, size });
  return pnl / risk;
}
