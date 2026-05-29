export const OUTCOMES = ["TP", "SL", "SP"] as const;

export type TradeOutcome = (typeof OUTCOMES)[number];

export type DashboardTrade = {
  id?: string;
  outcome?: TradeOutcome | string | null;
  pnl?: number | string | null;
  entry_at?: string | null;
  created_at?: string | null;
};

export type PnlPoint = { v: number };

export type OutcomeMetrics = {
  outcome: TradeOutcome;
  trades: number;
  pnl: number;
  winRate: number;
};

export type CalendarDay = {
  date: number;
  pnl: number;
  trades: number;
};

export type WeekTotal = {
  label: string;
  value: number;
};

export type DashboardMetrics = {
  totalTrades: number;
  netPnl: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  pnlSeries: PnlPoint[];
  outcomes: OutcomeMetrics[];
  calendar: {
    monthLabel: string;
    startPad: number;
    days: CalendarDay[];
    weekTotals: WeekTotal[];
  };
};

const MONTH_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const WEEK_LABELS = ["1st Week", "2nd Week", "3rd Week", "4th Week", "5th Week", "6th Week"];

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const sum = (items: number[]): number => items.reduce((total, value) => total + value, 0);

const average = (items: number[]): number => (items.length > 0 ? sum(items) / items.length : 0);

const tradeDate = (trade: DashboardTrade): Date | null => {
  const date = new Date(trade.entry_at ?? trade.created_at ?? "");
  return Number.isNaN(date.getTime()) ? null : date;
};

const dateKey = (date: Date): string => date.toISOString().slice(0, 10);

const sameUtcMonth = (date: Date, year: number, month: number): boolean =>
  date.getUTCFullYear() === year && date.getUTCMonth() === month;

const buildPnlSeries = (trades: DashboardTrade[], referenceDate: Date): PnlPoint[] => {
  const end = new Date(Date.UTC(
    referenceDate.getUTCFullYear(),
    referenceDate.getUTCMonth(),
    referenceDate.getUTCDate(),
  ));
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 29);

  const daily = new Map<string, number>();
  const keys: string[] = [];
  for (let i = 0; i < 30; i += 1) {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + i);
    const key = dateKey(day);
    keys.push(key);
    daily.set(key, 0);
  }

  for (const trade of trades) {
    const date = tradeDate(trade);
    const pnl = toNumber(trade.pnl);
    if (!date || pnl === null) continue;

    const key = dateKey(date);
    const current = daily.get(key);
    if (current !== undefined) daily.set(key, current + pnl);
  }

  let running = 0;
  return keys.map((key) => {
    running += daily.get(key) ?? 0;
    return { v: running };
  });
};

const buildCalendar = (trades: DashboardTrade[], referenceDate: Date): DashboardMetrics["calendar"] => {
  const year = referenceDate.getUTCFullYear();
  const month = referenceDate.getUTCMonth();
  const monthStart = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const startPad = (monthStart.getUTCDay() + 6) % 7;
  const weekCount = Math.ceil((startPad + daysInMonth) / 7);

  const days: CalendarDay[] = Array.from({ length: daysInMonth }, (_, index) => ({
    date: index + 1,
    pnl: 0,
    trades: 0,
  }));

  for (const trade of trades) {
    const date = tradeDate(trade);
    if (!date || !sameUtcMonth(date, year, month)) continue;

    const day = days[date.getUTCDate() - 1];
    if (!day) continue;

    day.trades += 1;

    const pnl = toNumber(trade.pnl);
    if (pnl !== null) day.pnl += pnl;
  }

  const weekTotals: WeekTotal[] = Array.from({ length: weekCount }, (_, index) => ({
    label: WEEK_LABELS[index] ?? `Week ${index + 1}`,
    value: 0,
  }));

  for (const day of days) {
    const weekIndex = Math.floor((startPad + day.date - 1) / 7);
    const week = weekTotals[weekIndex];
    if (week) week.value += day.pnl;
  }

  return {
    monthLabel: MONTH_FORMATTER.format(monthStart),
    startPad,
    days,
    weekTotals,
  };
};

const buildOutcomeStats = (trades: DashboardTrade[]): OutcomeMetrics[] => OUTCOMES.map((outcome) => {
  const outcomeTrades = trades.filter((trade) => trade.outcome === outcome);
  const pnlValues = outcomeTrades
    .map((trade) => toNumber(trade.pnl))
    .filter((value): value is number => value !== null);
  const wins = pnlValues.filter((pnl) => pnl > 0).length;

  return {
    outcome,
    trades: outcomeTrades.length,
    pnl: sum(pnlValues),
    winRate: pnlValues.length > 0 ? (wins / pnlValues.length) * 100 : 0,
  };
});

export function buildDashboardMetrics(
  trades: DashboardTrade[] = [],
  referenceDate: Date = new Date(),
): DashboardMetrics {
  const tradeRows = Array.isArray(trades) ? trades : [];
  const pnlValues = tradeRows
    .map((trade) => toNumber(trade.pnl))
    .filter((value): value is number => value !== null);
  const wins = pnlValues.filter((pnl) => pnl > 0);
  const losses = pnlValues.filter((pnl) => pnl < 0);

  return {
    totalTrades: tradeRows.length,
    netPnl: sum(pnlValues),
    winRate: pnlValues.length > 0 ? (wins.length / pnlValues.length) * 100 : 0,
    avgWin: average(wins),
    avgLoss: average(losses),
    pnlSeries: buildPnlSeries(tradeRows, referenceDate),
    outcomes: buildOutcomeStats(tradeRows),
    calendar: buildCalendar(tradeRows, referenceDate),
  };
}
