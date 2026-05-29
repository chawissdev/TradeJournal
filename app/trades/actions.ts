"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { requireAllowedUser } from "@/lib/authGuard";
import { createClient } from "@/utils/supabase/server";
import { buildTradePayload } from "./tradePayload.js";

export async function addTrade(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const auth = await requireAllowedUser(supabase);

  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const row = {
    user_id: auth.user.id,
    ...buildTradePayload(formData),
    entry_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("trades")
    .insert(row)
    .select(
      "id, symbol, side, outcome, leverage, size, entry, exit, pnl, fees, holding_duration, chart_url, plan, notes, entry_at",
    )
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/trades");
  revalidatePath("/history");
  revalidatePath("/");
  return { ok: true, trade: data };
}

export async function updateTrade(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const auth = await requireAllowedUser(supabase);
  const id = String(formData.get("id") ?? "");

  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  if (!id) {
    return { ok: false, error: "Missing trade id" };
  }

  const { error } = await supabase
    .from("trades")
    .update(buildTradePayload(formData))
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/trades");
  revalidatePath("/history");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteTrade(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const auth = await requireAllowedUser(supabase);

  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const { error } = await supabase
    .from("trades")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/trades");
  revalidatePath("/history");
  revalidatePath("/");
  return { ok: true };
}
