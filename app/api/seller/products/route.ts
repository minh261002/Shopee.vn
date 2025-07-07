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

    // Lấy store của seller
    const store = await prisma.store.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
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
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Lấy store của seller
    const store = await prisma.store.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      name,
      slug,
      description,
      shortDescription,
      categoryId,
      brandId,
      originalPrice,
      salePrice,
      sku,
      weight,
      length,
      width,
      height,
      stock,
      lowStockThreshold = 5,
      status = "DRAFT",
      condition = "NEW",
      tags = [],
      metaTitle,
      metaDescription,
      metaKeywords,
      features,
      specifications,
      isDigital = false,
      isFeatured = false,
      requiresShipping = true,
      images = [],
      variants = [],
    } = body;

    // Validation
    if (!name || !originalPrice || stock === undefined || !categoryId) {
      return NextResponse.json(
        { error: "Name, originalPrice, stock, and category are required" },
        { status: 400 }
      );
    }

    // Check if SKU exists for this store
    if (sku) {
      const existingSku = await prisma.product.findFirst({
        where: {
          sku,
          storeId: store.id,
        },
      });

      if (existingSku) {
        return NextResponse.json(
          { error: "SKU already exists in your store" },
          { status: 400 }
        );
      }
    }

    // Generate slug if not provided
    const finalSlug =
      slug ||
      name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();

    // Check if slug exists
    const existingSlug = await prisma.product.findFirst({
      where: { slug: finalSlug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 }
      );
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 }
      );
    }

    // Verify brand exists if provided
    if (brandId) {
      const brand = await prisma.brand.findUnique({
        where: { id: brandId },
      });

      if (!brand) {
        return NextResponse.json({ error: "Brand not found" }, { status: 400 });
      }
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        slug: finalSlug,
        description,
        shortDescription,
        storeId: store.id,
        categoryId,
        brandId,
        originalPrice: parseFloat(originalPrice),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        sku,
        weight: weight ? parseFloat(weight) : null,
        length: length ? parseFloat(length) : null,
        width: width ? parseFloat(width) : null,
        height: height ? parseFloat(height) : null,
        stock: parseInt(stock),
        lowStockThreshold: parseInt(lowStockThreshold),
        status: status as ProductStatus,
        condition: condition as ProductCondition,
        tags: tags.length > 0 ? JSON.stringify(tags) : null,
        metaTitle,
        metaDescription,
        metaKeywords,
        features: features ? JSON.stringify(features) : null,
        specifications: specifications ? JSON.stringify(specifications) : null,
        isDigital,
        isFeatured,
        requiresShipping,
        publishedAt: status === "ACTIVE" ? new Date() : null,
      },
    });

    // Create product images
    if (images && images.length > 0) {
      await Promise.all(
        images.map(
          (
            image: { url: string; alt?: string; caption?: string },
            index: number
          ) =>
            prisma.productImage.create({
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

    // Create product variants
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
            prisma.productVariant.create({
              data: {
                productId: product.id,
                name: `${variant.name}: ${variant.value}`,
                sku: variant.sku,
                price: variant.price
                  ? parseFloat(variant.price.toString())
                  : null,
                stock: parseInt(variant.stock.toString()),
                attributes: JSON.stringify({ [variant.name]: variant.value }),
              },
            })
        )
      );
    }

    // Update store product count
    await prisma.store.update({
      where: { id: store.id },
      data: {
        totalProducts: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
