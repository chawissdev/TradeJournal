"use server";

import { headers } from "next/headers";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { isAllowedEmail } from "@/lib/authConfig";

export async function sendMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) {
    return { ok: false, error: "Please enter your email." };
  }

  // Single-user gate: only the owner email may request a link.
  if (!isAllowedEmail(email)) {
    return { ok: false, error: "This email is not allowed to sign in." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const hdrs = await headers();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    hdrs.get("origin") ??
    `https://${hdrs.get("host") ?? ""}`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // Allow the link to create the user on first sign-in. The single-user
      // gate is enforced above (email check) and again in /auth/callback.
      shouldCreateUser: true,
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
