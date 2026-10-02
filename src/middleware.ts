import { NextResponse, type NextRequest } from "next/server";

// Cheap first gate: no session cookie, no dashboard. The real check
// (valid token, right role) happens in the pages and server actions.
export function middleware(req: NextRequest) {
  if (!req.cookies.get("rn_session")) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/admin/:path*"] };
