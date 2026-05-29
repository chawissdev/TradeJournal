"use client";
import { Bell, Filter, Plus } from "lucide-react";

export default function TopBar() {
  return (
    <div className="flex items-center justify-end gap-3 px-6 py-4">
      <button className="w-9 h-9 grid place-items-center rounded-lg border border-ink-300/40 bg-white hover:bg-surface-muted">
        <Filter size={16} className="text-ink-700" />
      </button>
      <button className="w-9 h-9 grid place-items-center rounded-lg border border-ink-300/40 bg-white hover:bg-surface-muted">
        <Bell size={16} className="text-ink-700" />
      </button>
      <button className="flex items-center gap-2 px-4 h-9 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium shadow-sm">
        Add account <Plus size={16} />
      </button>
    </div>
  );
}
