import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import TradeForm from "./TradeForm";
import TradeTable, { TradeRow } from "./TradeTable";

export const dynamic = "force-dynamic";

export default async function TradesPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("trades")
    .select("id, symbol, side, leverage, size, entry, exit, take_profit, stop_loss, stop_profit, pnl, plan, entry_at")
    .order("entry_at", { ascending: false })
    .limit(200);

  const trades = (data ?? []) as TradeRow[];

  return (
    <div className="flex">
      <Sidebar balance={315000.12} />

      <main className="flex-1 min-w-0">
        <TopBar />

        <div className="px-6 pb-10 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-ink-900">Trade Log</h1>
            <p className="text-sm text-ink-500 mt-1">
              Track every trade with leverage, size, entry/exit, TP/SL/SP, PNL and your plan.
            </p>
          </div>

          <TradeForm />

          {error && (
            <div className="text-sm text-danger-700 bg-danger-50 border border-danger-500/20 rounded-lg p-3">
              Could not load trades: {error.message}. Run the SQL migration first.
            </div>
          )}

          <TradeTable trades={trades} />
        </div>
      </main>
    </div>
  );
}
