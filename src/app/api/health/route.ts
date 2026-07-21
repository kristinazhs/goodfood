import { getSacolasDisponiveis } from "@/lib/sacolas";
import { NextResponse } from "next/server";

// TEMPORARY diagnostic — runs the real feed query and reports the actual
// error plus key length/prefix/suffix (to detect a truncated paste).
// The publishable key is non-secret; still, only length + 4 chars shown.
// Remove after debugging.
export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const info = {
    keyLen: key.length,
    keyPrefix: key.slice(0, 15),
    keySuffix: key.slice(-4),
    urlFromEnv: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  };

  try {
    const sacolas = await getSacolasDisponiveis();
    return NextResponse.json({ ok: true, count: sacolas.length, ...info });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: e instanceof Error ? e.message : String(e),
      ...info,
    });
  }
}
