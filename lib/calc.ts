export type Side = "LONG" | "SHORT";

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
