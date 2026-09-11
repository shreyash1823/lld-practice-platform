import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE = "learner_id";

export function middleware(request: NextRequest) {
  const existing = request.cookies.get(COOKIE)?.value;

  if (existing) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  response.cookies.set(COOKIE, crypto.randomUUID(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};