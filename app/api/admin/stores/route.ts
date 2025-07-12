import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { StoreStatus, StoreType, VerificationStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query params
    const searchParams = req.nextUrl.searchParams;
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") as StoreStatus | undefined;
    const type = searchParams.get("type") as StoreType | undefined;
    const verificationStatus = searchParams.get("verificationStatus") as
      | VerificationStatus
      | undefined;
    const city = searchParams.get("city") || undefined;
    const isVerified =
      searchParams.get("isVerified") === "true" ? true : undefined;
    const isFeatured =
      searchParams.get("isFeatured") === "true" ? true : undefined;
    const minRating = Number(searchParams.get("minRating")) || undefined;

    // Calculate skip
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(status ? { status } : {}),
      ...(type ? { type } : {}),
      ...(verificationStatus ? { verificationStatus } : {}),
      ...(city ? { city } : {}),
      ...(isVerified !== undefined ? { isVerified } : {}),
      ...(isFeatured !== undefined ? { isFeatured } : {}),
      ...(minRating ? { rating: { gte: minRating } } : {}),
    };

    // Get stores with pagination and related data
    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where,
        skip,
        take: limit,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              products: true,
              orders: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.store.count({ where }),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    // Transform data for frontend
    const transformedStores = stores.map((store) => ({
      ...store,
      totalProducts: store._count.products,
      totalOrders: store._count.orders,
      reviewCount: 0, // TODO: Add reviews to schema
      totalRevenue: 0, // TODO: Calculate from orders
    }));

    return NextResponse.json({
      stores: transformedStores,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error getting stores:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
