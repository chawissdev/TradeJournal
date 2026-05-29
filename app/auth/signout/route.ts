import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

async function signOut(request: Request) {
  const { origin } = new URL(request.url);
  const error = new URL(request.url).searchParams.get("error");
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  await supabase.auth.signOut();
  const destination = error ? `/login?error=${encodeURIComponent(error)}` : "/login";
  return NextResponse.redirect(`${origin}${destination}`, { status: 303 });
}

export async function GET(request: Request) {
  return signOut(request);
}

export async function POST(request: Request) {
  return signOut(request);
}
