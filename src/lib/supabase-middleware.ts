import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_URL, getSupabaseAnonKey } from "./supabase-config";

// Keeps the user's auth session fresh on every request by refreshing the
// token cookie. It does NOT block or redirect anything yet — that (route
// protection) comes in a later sub-step. Public pages keep working.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: don't run code between creating the client and this call.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const role = user?.user_metadata?.role as string | undefined;

  // --- Owner area: only logged-in establishments may enter ---------------
  const parceiroAuthPage =
    path === "/parceiro/entrar" || path === "/parceiro/cadastro";
  const inParceiroArea = path === "/parceiro" || path.startsWith("/parceiro/");
  if (inParceiroArea && !parceiroAuthPage) {
    if (!user) return redirectTo(request, response, "/parceiro/entrar");
    if (role !== "establishment") return redirectTo(request, response, "/consumidor");
  }

  // --- Consumer actions that require an account --------------------------
  // Perfil is here too: tapping it signed out used to land on a profile with
  // nobody in it, which reads as a broken screen rather than a locked one.
  const consumerProtected = [
    "/consumidor/checkout",
    "/consumidor/pagamento",
    "/consumidor/pedidos",
    "/consumidor/perfil",
  ];
  if (consumerProtected.some((p) => path.startsWith(p)) && !user) {
    // Carry where they were going. Losing it is what made someone who had
    // already chosen a sacola and pressed Pagar come back to an empty feed.
    return redirectTo(
      request,
      response,
      "/consumidor/entrar",
      path + request.nextUrl.search,
    );
  }

  return response;
}

// Redirect while preserving any auth cookies refreshed above.
function redirectTo(
  request: NextRequest,
  current: NextResponse,
  pathname: string,
  next?: string,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = next ? `?next=${encodeURIComponent(next)}` : "";
  const res = NextResponse.redirect(url);
  current.cookies.getAll().forEach((cookie) => res.cookies.set(cookie));
  return res;
}
