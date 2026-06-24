import { NextRequest, NextResponse } from "next/server";
import { accessCookieName } from "./app/auth";

export function middleware(request: NextRequest): Response {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(accessCookieName)?.value);

  if (pathname.startsWith("/app") && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"]
};
