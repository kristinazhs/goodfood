import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// TEMPORARY diagnostic endpoint — reports what the production runtime can see.
// Exposes only booleans + non-secret prefixes (the project ref and the
// "sb_publishable_" prefix are already public). Remove after debugging.
export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const env = {
    hasUrl: !!url,
    hasKey: !!key,
    urlHost: url ? url.replace(/^https?:\/\//, "").split(".")[0] : null,
    keyPrefix: key ? key.slice(0, 15) : null,
  };

  if (!url || !key) {
    return NextResponse.json({ ok: false, stage: "env", env });
  }

  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await supabase
      .from("establishments")
      .select("nome")
      .limit(1);
    if (error) {
      return NextResponse.json({ ok: false, stage: "query", env, error: error.message });
    }
    return NextResponse.json({ ok: true, env, sample: data });
  } catch (e) {
    return NextResponse.json({ ok: false, stage: "exception", env, error: String(e) });
  }
}
