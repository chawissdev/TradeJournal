import { isAllowedEmail } from "@/lib/authConfig";

type AuthUser = {
  id: string;
  email?: string | null;
};

type SupabaseAuthClient = {
  auth: {
    getUser: () => Promise<{
      data: { user: AuthUser | null };
      error: { message: string } | null;
    }>;
  };
};

type AllowedUserResult =
  | { ok: true; user: AuthUser }
  | { ok: false; error: string };

export async function requireAllowedUser(supabase: SupabaseAuthClient) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !isAllowedEmail(user.email)) {
    return { ok: false, error: "Not authorized" } satisfies AllowedUserResult;
  }

  return { ok: true, user } satisfies AllowedUserResult;
}
