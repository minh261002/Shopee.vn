import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { ProductStatus, Prisma } from "@prisma/client";
import type { ProductsResponse, ProductWithRelations } from "@/types/store";

// GET - Lấy danh sách tất cả sản phẩm cho admin
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") as ProductStatus | undefined;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    console.log("Admin products API - Request params:", {
      page,
      limit,
      search,
      status,
      sortBy,
      sortOrder,
    });

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      status: { not: "INACTIVE" }, // Exclude soft-deleted products
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
        { store: { name: { contains: search } } },
      ];
    }

    if (status) {
      where.status = status;
      console.log("Applying status filter:", status);
    }

    console.log("Final where clause:", JSON.stringify(where, null, 2));

    // Build orderBy
    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (sortBy === "name") orderBy.name = sortOrder as "asc" | "desc";
    else if (sortBy === "price")
      orderBy.originalPrice = sortOrder as "asc" | "desc";
    else if (sortBy === "rating") orderBy.rating = sortOrder as "asc" | "desc";
    else if (sortBy === "popularity")
      orderBy.purchaseCount = sortOrder as "asc" | "desc";
    else orderBy.createdAt = sortOrder as "asc" | "desc";

    // Get total count
    const total = await prisma.product.count({ where });

    // Get products with pagination
    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            rating: true,
            isVerified: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        images: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            productId: true,
            url: true,
            alt: true,
            caption: true,
            order: true,
            isMain: true,
            createdAt: true,
          },
        },
        variants: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            stock: true,
            attributes: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            wishlists: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    // Get stats for all products (regardless of current filter)
    const stats = await prisma.product.groupBy({
      by: ["status"],
      where: {
        status: { not: "INACTIVE" }, // Exclude soft-deleted products
      },
      _count: {
        status: true,
      },
    });

    const statsMap = stats.reduce(
      (acc, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      },
      {} as Record<string, number>
    );

    const response: ProductsResponse = {
      products: products.map((product) => ({
        ...product,
        // Parse JSON fields properly
        tags: product.tags ? JSON.parse(product.tags) : [],
        features: product.features ? JSON.parse(product.features) : undefined,
        specifications: product.specifications
          ? JSON.parse(product.specifications)
          : undefined,
        brand: product.brand
          ? {
              ...product.brand,
              logo: product.brand.logo || undefined,
            }
          : undefined,
        // Transform images to simple URLs for frontend compatibility
        images: product.images.map((img) => img.url),
      })) as unknown as ProductWithRelations[],
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      stats: {
        total:
          (statsMap["ACTIVE"] || 0) +
          (statsMap["PENDING_APPROVAL"] || 0) +
          (statsMap["DRAFT"] || 0),
        pending: statsMap["PENDING_APPROVAL"] || 0,
        active: statsMap["ACTIVE"] || 0,
        draft: statsMap["DRAFT"] || 0,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
