import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("admin_session");
  const isLoggedIn = !!session?.value;

  // Si ya está logueado y va al login → redirigir al panel
  if (pathname === "/admin/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Proteger /admin/* y /api/orders/* (requieren sesión)
  const isProtected =
    (pathname.startsWith("/admin") && pathname !== "/admin/login") ||
    pathname.startsWith("/api/orders/pending") ||
    (pathname.startsWith("/api/orders/") && pathname.endsWith("/confirm"));

  if (isProtected && !isLoggedIn) {
    // Las API devuelven 401, las páginas redirigen al login
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/orders/:path*"],
};
