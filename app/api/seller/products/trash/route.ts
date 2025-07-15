import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { Prisma } from "@prisma/client";
import type { ProductsResponse, ProductWithRelations } from "@/types/store";

// GET - Lấy danh sách sản phẩm đã bị ẩn của seller
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json(
        { error: "storeId is required" },
        { status: 400 }
      );
    }

    // Kiểm tra store có thuộc về seller này không
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        ownerId: session.user.id,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found or unauthorized" },
        { status: 404 }
      );
    }

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "updatedAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build where clause - only inactive products
    const where: Prisma.ProductWhereInput = {
      storeId: store.id,
      status: "INACTIVE",
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    // Build orderBy
    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (sortBy === "name") orderBy.name = sortOrder as "asc" | "desc";
    else if (sortBy === "price")
      orderBy.originalPrice = sortOrder as "asc" | "desc";
    else if (sortBy === "rating") orderBy.rating = sortOrder as "asc" | "desc";
    else if (sortBy === "popularity")
      orderBy.purchaseCount = sortOrder as "asc" | "desc";
    else orderBy.updatedAt = sortOrder as "asc" | "desc";

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
            orderItems: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

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
        store: {
          id: store.id,
          name: store.name,
          slug: store.slug,
          logo: store.logo || undefined,
          rating: store.rating,
          isVerified: store.isVerified,
        },
        // Transform images to simple URLs for frontend compatibility
        images: product.images.map((img) => img.url),
      })) as unknown as ProductWithRelations[],
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching deleted products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
