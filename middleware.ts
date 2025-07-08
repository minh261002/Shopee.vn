import { NextRequest, NextResponse } from "next/server";

// Cache để tránh gọi API liên tục
interface SessionData {
  user?: {
    role?: string;
    id?: string;
  };
}

const sessionCache = new Map<
  string,
  { session: SessionData | null; timestamp: number }
>();
const CACHE_DURATION = 5000; // 5 seconds

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestId = Math.random().toString(36).substring(7);

  console.log(`[Middleware-${requestId}] Processing: ${pathname}`);

  // Xác định loại route
  const routeChecks = {
    isAdminRoute: pathname.startsWith("/admin"),
    isSellerRoute: pathname.startsWith("/seller"),
    isSellerRegister:
      pathname === "/seller-register" ||
      pathname.startsWith("/seller-register/"),
  };

  const needsAuth =
    routeChecks.isAdminRoute ||
    routeChecks.isSellerRoute ||
    routeChecks.isSellerRegister;

  // Nếu không cần auth → cho qua
  if (!needsAuth) {
    return NextResponse.next();
  }

  // Tránh vòng lặp redirect
  const publicPaths = ["/login", "/unauthorized", "/api"];
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    console.log(`[Middleware-${requestId}] Public path, allowing through`);
    return NextResponse.next();
  }

  try {
    // Thử cache trước
    const cookieHeader = request.headers.get("cookie") || "";
    const cacheKey = `${cookieHeader}-${pathname}`;
    const cached = sessionCache.get(cacheKey);

    let session;
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      session = cached.session;
      console.log(`[Middleware-${requestId}] Using cached session`);
    } else {
      // Gọi API session với timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(
        `${request.nextUrl.origin}/api/auth/session`,
        {
          headers: { cookie: cookieHeader },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.log(
          `[Middleware-${requestId}] Session API failed: ${response.status}`
        );
        return redirectTo("/login", request, requestId);
      }

      session = await response.json();

      // Cache session
      sessionCache.set(cacheKey, { session, timestamp: Date.now() });

      // Cleanup old cache entries
      for (const [key, value] of sessionCache.entries()) {
        if (Date.now() - value.timestamp > CACHE_DURATION * 2) {
          sessionCache.delete(key);
        }
      }
    }

    const role = session?.user?.role;
    console.log(`[Middleware-${requestId}] User role: ${role}`);

    if (!role) {
      console.log(
        `[Middleware-${requestId}] No role found, redirecting to login`
      );
      return redirectTo("/login", request, requestId);
    }

    // Xử lý từng loại route
    if (routeChecks.isAdminRoute) {
      if (role !== "ADMIN") {
        console.log(
          `[Middleware-${requestId}] Admin route accessed by ${role}, unauthorized`
        );
        return redirectTo("/unauthorized", request, requestId);
      }
    }

    if (routeChecks.isSellerRoute) {
      if (role !== "SELLER" && role !== "ADMIN") {
        console.log(
          `[Middleware-${requestId}] Seller route accessed by ${role}, redirecting to seller-register`
        );
        return redirectTo("/seller-register", request, requestId);
      }
    }

    if (routeChecks.isSellerRegister) {
      if (role === "SELLER") {
        console.log(
          `[Middleware-${requestId}] Seller accessing register page, redirecting to dashboard`
        );
        return redirectTo("/seller/dashboard", request, requestId);
      }

      if (role === "ADMIN") {
        console.log(
          `[Middleware-${requestId}] Admin accessing seller register, redirecting to admin dashboard`
        );
        return redirectTo("/admin/dashboard", request, requestId);
      }

      if (role !== "USER") {
        console.log(
          `[Middleware-${requestId}] Invalid role for seller register: ${role}`
        );
        return redirectTo("/unauthorized", request, requestId);
      }
    }

    console.log(`[Middleware-${requestId}] Access granted`);
    return NextResponse.next();
  } catch (err) {
    console.error(`[Middleware-${requestId}] Error:`, err);

    if (err instanceof Error && err.name === "AbortError") {
      console.log(`[Middleware-${requestId}] Request timeout`);
    }

    return redirectTo("/login", request, requestId);
  }
}

function redirectTo(path: string, request: NextRequest, requestId: string) {
  console.log(`[Middleware-${requestId}] Redirecting to: ${path}`);
  return NextResponse.redirect(new URL(path, request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/seller/:path*", "/seller-register/:path*"],
};
