"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { requireAllowedUser } from "@/lib/authGuard";
import { createClient } from "@/utils/supabase/server";

const parseBalance = (value: FormDataEntryValue | null) => {
  const balance = Number(value);
  return Number.isFinite(balance) ? balance : null;
};

export async function updateAccountBalance(formData: FormData) {
  const balance = parseBalance(formData.get("balance"));

  if (balance === null || balance < 0) {
    return { ok: false, error: "Balance must be 0 or higher" };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const auth = await requireAllowedUser(supabase);

  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const { error } = await supabase
    .from("account_settings")
    .upsert(
      {
        id: "main",
        balance,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/trades");

  return { ok: true, balance };
}
