import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// Where an OAuth provider (Google) sends the person back to. Supabase gives
// us a one-time `code`; exchanging it here is what actually creates the
// cookie session.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/consumidor";

  if (!code) {
    return NextResponse.redirect(`${origin}/consumidor/entrar?erro=oauth`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/consumidor/entrar?erro=oauth`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
