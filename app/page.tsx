import { cookies } from "next/headers";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import StatCard from "@/components/StatCard";
import OutcomePanel from "@/components/OutcomePanel";
import CalendarPanel from "@/components/CalendarPanel";
import { buildDashboardMetrics, type DashboardTrade } from "@/lib/dashboardMetrics";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

const numberOrZero = (value: unknown) => {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [tradesResult, accountResult] = await Promise.all([
    supabase
      .from("trades")
      .select("id, outcome, pnl, entry_at")
      .order("entry_at", { ascending: false })
      .limit(500),
    supabase
      .from("account_settings")
      .select("balance")
      .eq("id", "main")
      .maybeSingle(),
  ]);

  const trades = (tradesResult.data ?? []) as DashboardTrade[];
  const metrics = buildDashboardMetrics(trades, new Date());
  const balance = numberOrZero(accountResult.data?.balance);
  const dashboardError = tradesResult.error?.message ?? accountResult.error?.message;

  return (
    <div className="flex">
      <Sidebar balance={balance} />

      <main className="flex-1 min-w-0">
        <TopBar />

        <div className="px-6 pb-10">
          <div className="bg-white rounded-2xl border border-ink-300/40 p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-2xl font-semibold text-ink-900">Dashboard</h1>
                <p className="mt-1 text-sm text-ink-500">Performance from your saved trades.</p>
              </div>
            </div>

            {dashboardError && (
              <div className="mb-5 text-sm text-danger-700 bg-danger-50 border border-danger-500/20 rounded-lg p-3">
                Could not load dashboard data: {dashboardError}. Run the SQL migration first.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                label="NET P&L"
                value={formatCurrency(metrics.netPnl)}
                badge={metrics.totalTrades}
                data={metrics.pnlSeries}
                color={metrics.netPnl < 0 ? "red" : "blue"}
              />
              <StatCard
                label="Win Rate"
                value={formatPercent(metrics.winRate)}
                badge={`${metrics.totalTrades} trades`}
                data={metrics.pnlSeries}
                color="blue"
              />
              <StatCard
                label="AVG win trade"
                value={formatCurrency(metrics.avgWin)}
                data={metrics.pnlSeries}
                color="green"
              />
              <StatCard
                label="AVG loss trade"
                value={formatCurrency(metrics.avgLoss)}
                data={metrics.pnlSeries}
                color="red"
              />
            </div>
          </div>

          <div className="space-y-6">
            <OutcomePanel outcomes={metrics.outcomes} />
            <CalendarPanel
              monthLabel={metrics.calendar.monthLabel}
              startPad={metrics.calendar.startPad}
              days={metrics.calendar.days}
              weekTotals={metrics.calendar.weekTotals}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
