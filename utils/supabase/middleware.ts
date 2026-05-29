import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

type CookieToSet = { name: string; value: string; options: CookieOptions };

export const createClient = (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  });

  // If env vars are missing (e.g. on Vercel without config), skip auth
  // refresh so the page still loads. Set env vars in Vercel dashboard.
  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: CookieToSet[]) {
            cookiesToSet.forEach(({ name, value }: CookieToSet) =>
              request.cookies.set(name, value),
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }: CookieToSet) =>
              supabaseResponse.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    void supabase.auth.getUser();
  } catch (e) {
    // swallow — don't break the request
    console.error("supabase middleware error:", e);
  }

  return supabaseResponse;
};
