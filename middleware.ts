import { NextRequest, NextResponse } from "next/server";

// Types for better type safety
interface SessionData {
  user?: {
    role?: "ADMIN" | "SELLER" | "USER";
    id?: string;
  };
}

interface CacheEntry {
  session: SessionData | null;
  timestamp: number;
}

interface RouteChecks {
  isAdminRoute: boolean;
  isSellerRoute: boolean;
  isSellerRegister: boolean;
}

// Constants
const CACHE_DURATION = 5000; // 5 seconds
const SESSION_TIMEOUT = 3000; // 3 seconds
const MAX_CACHE_SIZE = 1000;

// Cache with size limit and cleanup
class SessionCache {
  private cache = new Map<string, CacheEntry>();

  get(key: string): CacheEntry | undefined {
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
      return entry;
    }
    if (entry) {
      this.cache.delete(key);
    }
    return undefined;
  }

  set(key: string, value: CacheEntry): void {
    // Cleanup if cache is getting too large
    if (this.cache.size >= MAX_CACHE_SIZE) {
      this.cleanup();
    }
    this.cache.set(key, value);
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > CACHE_DURATION * 2) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach((key) => this.cache.delete(key));

    // If still too large, remove oldest entries
    if (this.cache.size >= MAX_CACHE_SIZE) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toRemove = entries.slice(0, Math.floor(MAX_CACHE_SIZE / 2));
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }
}

const sessionCache = new SessionCache();

// Route checking functions
const getRouteChecks = (pathname: string): RouteChecks => ({
  isAdminRoute: pathname.startsWith("/admin"),
  isSellerRoute:
    pathname.startsWith("/seller") && !pathname.startsWith("/seller-register"),
  isSellerRegister:
    pathname === "/seller-register" || pathname.startsWith("/seller-register/"),
});

const isPublicPath = (pathname: string): boolean => {
  const publicPaths = ["/login", "/unauthorized", "/api"];
  return publicPaths.some((path) => pathname.startsWith(path));
};

const needsAuthentication = (routeChecks: RouteChecks): boolean => {
  return (
    routeChecks.isAdminRoute ||
    routeChecks.isSellerRoute ||
    routeChecks.isSellerRegister
  );
};

// Session fetching with better error handling
const fetchSession = async (
  request: NextRequest
): Promise<SessionData | null> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SESSION_TIMEOUT);

  try {
    const response = await fetch(`${request.nextUrl.origin}/api/auth/session`, {
      headers: {
        cookie: request.headers.get("cookie") || "",
        "User-Agent": request.headers.get("User-Agent") || "",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Session API failed with status: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        console.warn("Session request timed out");
      } else {
        console.error("Session fetch error:", error.message);
      }
    }

    return null;
  }
};

// Authorization logic - phân quyền rõ ràng
const checkAuthorization = (
  role: string | undefined,
  routeChecks: RouteChecks,
  requestId: string
): { authorized: boolean; redirectPath?: string } => {
  if (!role) {
    console.log(`[${requestId}] No role found, redirecting to login`);
    return { authorized: false, redirectPath: "/login" };
  }

  // Admin route access - CHỈ ADMIN được vào
  if (routeChecks.isAdminRoute) {
    if (role !== "ADMIN") {
      console.log(
        `[${requestId}] Admin route accessed by ${role}, unauthorized`
      );
      return { authorized: false, redirectPath: "/unauthorized" };
    }
    return { authorized: true };
  }

  // Seller route access - CHỈ SELLER được vào (Admin KHÔNG được vào)
  if (routeChecks.isSellerRoute) {
    if (role === "SELLER") {
      return { authorized: true };
    }

    if (role === "ADMIN") {
      console.log(
        `[${requestId}] Admin trying to access seller route, redirecting to admin dashboard`
      );
      return { authorized: false, redirectPath: "/admin/dashboard" };
    }

    if (role === "USER") {
      console.log(
        `[${requestId}] User trying to access seller route, redirecting to seller-register`
      );
      return { authorized: false, redirectPath: "/seller-register" };
    }

    console.log(`[${requestId}] Invalid role ${role} for seller route`);
    return { authorized: false, redirectPath: "/unauthorized" };
  }

  // Seller registration page access - CHỈ USER được vào
  if (routeChecks.isSellerRegister) {
    if (role === "USER") {
      console.log(`[${requestId}] User accessing seller register - allowed`);
      return { authorized: true };
    }

    if (role === "SELLER") {
      console.log(
        `[${requestId}] Seller accessing register page, redirecting to seller dashboard`
      );
      return { authorized: false, redirectPath: "/seller/dashboard" };
    }

    if (role === "ADMIN") {
      console.log(
        `[${requestId}] Admin accessing seller register, redirecting to admin dashboard`
      );
      return { authorized: false, redirectPath: "/admin/dashboard" };
    }

    console.log(`[${requestId}] Invalid role ${role} for seller register`);
    return { authorized: false, redirectPath: "/unauthorized" };
  }

  return { authorized: true };
};

// Main middleware function
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestId = Math.random().toString(36).substring(7);

  console.log(`[${requestId}] Processing: ${pathname}`);

  const routeChecks = getRouteChecks(pathname);

  // Early return for routes that don't need auth
  if (!needsAuthentication(routeChecks)) {
    return NextResponse.next();
  }

  // Skip auth for public paths to avoid redirect loops
  if (isPublicPath(pathname)) {
    console.log(`[${requestId}] Public path, allowing through`);
    return NextResponse.next();
  }

  try {
    // Generate cache key
    const cookieHeader = request.headers.get("cookie") || "";
    const cacheKey = `${cookieHeader}-${pathname}`;

    // Try to get session from cache
    let session: SessionData | null = null;
    const cachedEntry = sessionCache.get(cacheKey);

    if (cachedEntry) {
      session = cachedEntry.session;
      console.log(`[${requestId}] Using cached session`);
    } else {
      // Fetch fresh session
      console.log(`[${requestId}] Fetching fresh session`);
      session = await fetchSession(request);

      // Cache the result
      sessionCache.set(cacheKey, {
        session,
        timestamp: Date.now(),
      });
    }

    const role = session?.user?.role;
    console.log(`[${requestId}] User role: ${role || "none"}`);

    // Check authorization
    const authResult = checkAuthorization(role, routeChecks, requestId);

    if (!authResult.authorized) {
      const redirectPath = authResult.redirectPath || "/login";
      console.log(`[${requestId}] Redirecting to: ${redirectPath}`);
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    console.log(`[${requestId}] Access granted`);
    return NextResponse.next();
  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error);

    // Fallback to login on any unexpected error
    console.log(`[${requestId}] Fallback redirect to login`);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// Middleware configuration
export const config = {
  matcher: ["/admin/:path*", "/seller/:path*", "/seller-register/:path*"],
};
