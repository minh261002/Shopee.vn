import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/admin", "/seller", "/seller-register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  if (!isProtected) return NextResponse.next();

  try {
    const response = await fetch(`${request.nextUrl.origin}/api/auth/session`, {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });

    if (!response.ok) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const session = await response.json();

    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const role = session.user.role;

    // Admin có thể truy cập mọi route
    if (role === "ADMIN") {
      return NextResponse.next();
    }

    // Logic phân quyền cho từng route
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (pathname.startsWith("/seller")) {
      // Nếu là SELLER thì cho phép vào /seller/*
      if (role === "SELLER") {
        return NextResponse.next();
      }
      // Nếu không phải SELLER thì chuyển về trang đăng ký
      return NextResponse.redirect(new URL("/seller-register", request.url));
    }

    if (pathname.startsWith("/seller-register")) {
      // Chỉ USER mới được vào trang đăng ký seller
      if (role === "USER") {
        return NextResponse.next();
      }
      // SELLER đã có shop thì về trang seller
      if (role === "SELLER") {
        return NextResponse.redirect(new URL("/seller", request.url));
      }
      // Còn lại thì về unauthorized
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware session error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/seller/:path*",
    "/seller-register/:path*",
    "/seller-register",
  ],
};
