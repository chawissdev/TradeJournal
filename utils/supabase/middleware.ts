import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { isAllowedEmail } from "@/lib/authConfig";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

type CookieToSet = { name: string; value: string; options: CookieOptions };

// Paths that are reachable without a session.
const PUBLIC_PREFIXES = ["/login", "/auth"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function redirectToLogin(request: NextRequest, error: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("error", error);
  return NextResponse.redirect(url);
}

export const createClient = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  });

  const { pathname } = request.nextUrl;

  // Keep auth fail-closed for protected pages. Public auth pages can still
  // render and show a configuration/sign-in error.
  if (!supabaseUrl || !supabaseKey) {
    return isPublicPath(pathname) ? supabaseResponse : redirectToLogin(request, "config");
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
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
    });

    // IMPORTANT: getUser() refreshes the session cookie.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Gate: anyone without a session is sent to /login,
    // except for the public auth paths themselves.
    if (!user && !isPublicPath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    if (user && !isAllowedEmail(user.email)) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/signout";
      url.searchParams.set("error", "not_allowed");
      return NextResponse.redirect(url);
    }

    // If already signed in, keep them out of /login.
    if (user && pathname === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.delete("next");
      return NextResponse.redirect(url);
    }
  } catch (e) {
    console.error("supabase middleware error:", e);
    if (!isPublicPath(pathname)) return redirectToLogin(request, "auth_check");
  }

  return supabaseResponse;
};
