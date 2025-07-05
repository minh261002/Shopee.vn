import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  const role = session?.user?.role;

  if (!role) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  let redirectUrl = "/";
  if (role === "ADMIN") redirectUrl = "/admin/dashboard";
  else if (role === "SELLER") redirectUrl = "/seller/dashboard";

  return NextResponse.redirect(new URL(redirectUrl, request.url));
}
