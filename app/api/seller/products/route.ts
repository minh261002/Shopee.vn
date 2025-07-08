import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { ProductStatus, ProductCondition, Prisma } from "@prisma/client";
import type { ProductsResponse, ProductWithRelations } from "@/types/store";

// GET - Lấy danh sách sản phẩm của seller
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
    const status = searchParams.get("status") as ProductStatus | undefined;
    const condition = searchParams.get("condition") as
      | ProductCondition
      | undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const isFeatured =
      searchParams.get("isFeatured") === "true" ? true : undefined;
    const inStock = searchParams.get("inStock") === "true" ? true : undefined;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      storeId: store.id,
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    if (status) where.status = status;
    if (condition) where.condition = condition;
    if (categoryId) where.categoryId = categoryId;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;
    if (inStock) where.stock = { gt: 0 };

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
          isVerified: store.verificationStatus === "VERIFIED",
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
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Tạo sản phẩm mới
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Get storeId from request body or query params
    const storeId = data.storeId || req.url.split("?")[0].split("/").pop();

    if (!storeId) {
      return NextResponse.json(
        { error: "storeId is required" },
        { status: 400 }
      );
    }

    // Get store of current user
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        ownerId: session.user.id,
        status: "ACTIVE",
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Không tìm thấy cửa hàng hoặc cửa hàng chưa được kích hoạt" },
        { status: 404 }
      );
    }

    // Check if product has brandId
    if (data.brandId) {
      // First check if the brand exists
      const brand = await prisma.brand.findUnique({
        where: { id: data.brandId },
      });

      if (!brand) {
        return NextResponse.json(
          { error: "Thương hiệu không tồn tại" },
          { status: 400 }
        );
      }

      // Check if store has approved brand registration for this brand
      const brandRegistration = await prisma.brandRegistration.findFirst({
        where: {
          storeId: store.id,
          brandId: data.brandId,
          status: "APPROVED",
        },
      });

      if (!brandRegistration) {
        return NextResponse.json(
          {
            error:
              "Bạn chưa được phép bán sản phẩm của thương hiệu này. Vui lòng đăng ký thương hiệu và chờ duyệt trước khi thêm sản phẩm.",
          },
          { status: 403 }
        );
      }
    }

    // Handle product status based on store type and selected status
    let finalStatus: ProductStatus = data.status;

    // If store is not OFFICIAL and trying to set status to ACTIVE
    if (store.type !== "OFFICIAL" && data.status === "ACTIVE") {
      finalStatus = "PENDING_APPROVAL";
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        ...data,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        storeId: store.id,
        brandId: data.brandId, // Đảm bảo brandId được lưu
        status: finalStatus,
        publishedAt: finalStatus === "ACTIVE" ? new Date() : null,
        images: {
          create: data.images?.map((image: { url: string; alt: string }) => ({
            url: image.url,
            alt: image.alt,
          })),
        },
        variants: data.variants
          ? {
              create: data.variants,
            }
          : undefined,
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          select: {
            id: true,
            url: true,
            alt: true,
            order: true,
            isMain: true,
          },
        },
        variants: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            stock: true,
            attributes: true,
            isActive: true,
          },
        },
      },
    });

    // If status was changed to PENDING_APPROVAL, inform the user
    if (data.status === "ACTIVE" && finalStatus === "PENDING_APPROVAL") {
      return NextResponse.json({
        product,
        message: "Sản phẩm đã được tạo và đang chờ duyệt trước khi đăng bán",
      });
    }

    return NextResponse.json({
      product,
      message:
        finalStatus === "DRAFT"
          ? "Sản phẩm đã được lưu dưới dạng bản nháp"
          : "Sản phẩm đã được tạo thành công",
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi tạo sản phẩm" },
      { status: 500 }
    );
  }
}
