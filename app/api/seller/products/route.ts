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
      status: { not: "INACTIVE" }, // Exclude soft-deleted products
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

    // Validation
    if (
      !data.name ||
      !data.originalPrice ||
      data.stock === undefined ||
      !data.categoryId
    ) {
      return NextResponse.json(
        { error: "Name, originalPrice, stock, and category are required" },
        { status: 400 }
      );
    }

    // Validate price
    if (data.originalPrice <= 0) {
      return NextResponse.json(
        { error: "Original price must be greater than 0" },
        { status: 400 }
      );
    }

    // Validate sale price
    if (data.salePrice && data.salePrice >= data.originalPrice) {
      return NextResponse.json(
        { error: "Sale price must be less than original price" },
        { status: 400 }
      );
    }

    // Validate stock
    if (data.stock < 0) {
      return NextResponse.json(
        { error: "Stock cannot be negative" },
        { status: 400 }
      );
    }

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
    }

    // Validate SKU uniqueness globally (since database constraint is global)
    if (data.sku && data.sku.trim()) {
      const existingSku = await prisma.product.findFirst({
        where: {
          sku: data.sku.trim(),
          status: { not: "INACTIVE" },
        },
      });

      if (existingSku) {
        return NextResponse.json(
          { error: "SKU đã tồn tại trong hệ thống" },
          { status: 400 }
        );
      }
    }

    // Generate slug if not provided
    const slug =
      data.slug ||
      data.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();

    // Check if slug exists
    const existingSlug = await prisma.product.findFirst({
      where: {
        slug,
        status: { not: "INACTIVE" },
      },
    });

    if (existingSlug) {
      return NextResponse.json({ error: "Slug đã tồn tại" }, { status: 400 });
    }

    // Handle product status based on store type and selected status
    let finalStatus: ProductStatus = data.status;

    // If store is not OFFICIAL and trying to set status to ACTIVE
    if (store.type !== "OFFICIAL" && data.status === "ACTIVE") {
      finalStatus = "PENDING_APPROVAL";
    }

    // Create product using transaction for data consistency
    const product = await prisma.$transaction(async (tx) => {
      // Extract images and variants from data to create them separately
      const { images, variants, ...productDataWithoutRelations } = data;

      const productData = {
        ...productDataWithoutRelations,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        storeId: store.id,
        brandId: data.brandId,
        status: finalStatus,
        publishedAt: finalStatus === "ACTIVE" ? new Date() : null,
        // Handle SKU - only set if it's not empty
        sku: data.sku && data.sku.trim() ? data.sku.trim() : null,
      };

      const product = await tx.product.create({
        data: productData,
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
        },
      });

      // Create product images if provided
      if (images && images.length > 0) {
        await Promise.all(
          images.map(
            (
              image: { url: string; alt?: string; caption?: string },
              index: number
            ) =>
              tx.productImage.create({
                data: {
                  productId: product.id,
                  url: image.url,
                  alt: image.alt || product.name,
                  caption: image.caption,
                  order: index,
                  isMain: index === 0,
                },
              })
          )
        );
      }

      // Create product variants if provided
      if (variants && variants.length > 0) {
        await Promise.all(
          variants.map(
            (variant: {
              name: string;
              value: string;
              price?: number;
              stock: number;
              sku: string;
            }) =>
              tx.productVariant.create({
                data: {
                  productId: product.id,
                  name: `${variant.name}: ${variant.value}`,
                  sku: variant.sku,
                  price: variant.price
                    ? parseFloat(variant.price.toString())
                    : null,
                  stock: parseInt(variant.stock.toString()),
                  attributes: JSON.stringify({ [variant.name]: variant.value }),
                  isActive: true,
                },
              })
          )
        );
      }

      // Fetch the complete product with all relations
      const completeProduct = await tx.product.findUnique({
        where: { id: product.id },
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

      return completeProduct;
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
