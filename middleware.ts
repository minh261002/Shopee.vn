import { NextRequest, NextResponse } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { GET } = toNextJsHandler(auth);
  await GET(request);

  //check better-auth.session_token in cookies, nếu có token, token hợp lệ thì next
  const sessionToken = request.cookies.get("better-auth.session_token");
  if (sessionToken) {
    return NextResponse.next();
  }
  //nếu không có token, chuyển hướng login
  return NextResponse.redirect(new URL("/login", request.url));

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/seller/:path*"],
};
