import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import type { TradeRow } from "../trades/TradeTable";
import HistoryView from "./HistoryView";

export const dynamic = "force-dynamic";

const numberOrZero = (value: unknown) => {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
};

export default async function HistoryPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [tradesResult, accountResult] = await Promise.all([
    supabase
      .from("trades")
      .select(
        "id, symbol, side, outcome, leverage, size, entry, exit, pnl, fees, holding_duration, chart_url, plan, notes, entry_at",
      )
      .order("entry_at", { ascending: false })
      .limit(500),
    supabase
      .from("account_settings")
      .select("balance")
      .eq("id", "main")
      .maybeSingle(),
  ]);

  const trades = (tradesResult.data ?? []) as TradeRow[];
  const balance = numberOrZero(accountResult.data?.balance);

  return (
    <div className="flex">
      <Sidebar balance={balance} />

      <main className="flex-1 min-w-0">
        <TopBar />

        <div className="px-6 pb-10 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-ink-900">Trade History</h1>
            <p className="text-sm text-ink-500 mt-1">
              All your trades. Edit, review and delete past entries here.
            </p>
          </div>

          {tradesResult.error && (
            <div className="text-sm text-danger-700 bg-danger-50 border border-danger-500/20 rounded-lg p-3">
              Could not load trades: {tradesResult.error.message}. Run the SQL migration first.
            </div>
          )}

          <HistoryView trades={trades} />
        </div>
      </main>
    </div>
  );
}
