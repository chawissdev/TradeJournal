import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import StatCard from "@/components/StatCard";
import SessionsPanel from "@/components/SessionsPanel";
import CalendarPanel from "@/components/CalendarPanel";
import { Download, Filter } from "lucide-react";

// Mock sparkline data — swap with API result
const series = (seed: number) =>
  Array.from({ length: 30 }, (_, i) => ({
    v: 50 + Math.sin(i / 2 + seed) * 12 + Math.cos(i / 3 + seed) * 8,
  }));

export default function DashboardPage() {
  return (
    <div className="flex">
      <Sidebar balance={315000.12} />

      <main className="flex-1 min-w-0">
        <TopBar />

        <div className="px-6 pb-10">
          <div className="bg-white rounded-2xl border border-ink-300/40 p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h1 className="text-2xl font-semibold text-ink-900">Dashboard</h1>
              <div className="flex items-center gap-2">
                <button className="w-9 h-9 grid place-items-center rounded-lg border border-ink-300/40 hover:bg-surface-muted">
                  <Filter size={16} className="text-ink-700" />
                </button>
                <button className="flex items-center gap-2 px-3 h-9 rounded-lg border border-ink-300/40 hover:bg-surface-muted text-sm">
                  <Download size={16} className="text-ink-700" /> Export stats
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard label="NET P&L"      value="$18.5k"  badge={22} data={series(1)} color="blue" />
              <StatCard label="Day Win"      value="50.00%" badge={22} data={series(2)} color="blue" />
              <StatCard label="AVG win trade"  value="0.00%" badge={0}  data={series(3)} color="green" />
              <StatCard label="AVG loss trade" value="0.00%" badge={22} data={series(4)} color="red" />
            </div>
          </div>

          <div className="space-y-6">
            <SessionsPanel />
            <CalendarPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
