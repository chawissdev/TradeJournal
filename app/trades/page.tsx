import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import SessionTrades from "./SessionTrades";

export const dynamic = "force-dynamic";

const numberOrZero = (value: unknown) => {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
};

export default async function TradesPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: account } = await supabase
    .from("account_settings")
    .select("balance")
    .eq("id", "main")
    .maybeSingle();

  const balance = numberOrZero(account?.balance);

  return (
    <div className="flex">
      <Sidebar balance={balance} />

      <main className="flex-1 min-w-0">
        <TopBar />

        <div className="px-6 pb-10 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-ink-900">New Trade</h1>
            <p className="text-sm text-ink-500 mt-1">
              Log a trade with leverage, quantity, duration, entry/exit, outcome, auto PNL and your plan.
            </p>
          </div>

          <SessionTrades />
        </div>
      </main>
    </div>
  );
}
