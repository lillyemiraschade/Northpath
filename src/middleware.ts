import { NextRequest, NextResponse } from "next/server";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth check for login page, verify endpoint, cron jobs, and static assets
  const publicPaths = ["/login", "/api/auth/verify", "/api/cron/", "/privacy", "/_next/", "/favicon.ico"];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  if (!isPublic) {
    const session = request.cookies.get("northpath_session")?.value;
    if (session !== "authenticated") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Rate limiting for API routes (exclude cron)
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/cron/")) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetAt) {
      rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    } else {
      entry.count++;
      if (entry.count > MAX_REQUESTS) {
        return NextResponse.json(
          { error: "Too many requests" },
          { status: 429, headers: { "Retry-After": "60" } }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
