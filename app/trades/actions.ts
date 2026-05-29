"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { calcPnL, calcRMultiple } from "@/lib/calc";

export async function addTrade(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  // For dev without auth, we still allow insert — RLS will block it in prod.
  // To test, disable RLS or sign in via magic link.

  const f = (k: string) => formData.get(k);
  const n = (k: string) => {
    const v = f(k);
    return v === null || v === "" ? null : Number(v);
  };

  const side = String(f("side")) as "LONG" | "SHORT";
  const entry = Number(f("entry"));
  const exit = n("exit");
  const size = Number(f("size"));
  const stopLoss = n("stop_loss");
  const fees = Number(f("fees") ?? 0);

  // Auto-calc PNL if user left it blank but provided exit
  let pnl = n("pnl");
  if (pnl === null && exit !== null) {
    pnl = calcPnL({ side, entry, exit, size, fees });
  }

  let rMultiple: number | null = null;
  if (exit !== null && stopLoss !== null) {
    rMultiple = calcRMultiple({ side, entry, exit, stopLoss, size });
  }

  const row = {
    user_id: user?.id ?? null,
    symbol: String(f("symbol")).toUpperCase(),
    side,
    leverage: Number(f("leverage") ?? 1),
    size,
    entry,
    exit,
    take_profit: n("take_profit"),
    stop_loss: stopLoss,
    stop_profit: n("stop_profit"),
    pnl,
    r_multiple: rMultiple,
    fees,
    plan: f("plan") || null,
    notes: f("notes") || null,
    session: f("session") || null,
    entry_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("trades").insert(row);
  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/trades");
  return { ok: true };
}

export async function deleteTrade(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  await supabase.from("trades").delete().eq("id", id);
  revalidatePath("/trades");
}
