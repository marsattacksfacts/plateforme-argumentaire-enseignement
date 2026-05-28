import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  // Ne rien faire sur les pages non-admin
  if (!req.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Laisser passer la page de login
  if (req.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Vérifier le token
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll().map(c => ({ name: c.name, value: c.value })),
        setAll: (cookies) => cookies.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    const redirectUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};