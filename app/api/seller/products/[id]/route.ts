import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { ProductStatus, ProductCondition } from "@prisma/client";

// GET - Lấy thông tin sản phẩm theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        storeId: store.id, // Đảm bảo chỉ lấy sản phẩm của store này
      },
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
        },
        variants: {
          where: { isActive: true },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: {
            reviews: true,
            wishlists: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...product,
      // Parse JSON fields properly
      tags: product.tags ? JSON.parse(product.tags) : [],
      features: product.features ? JSON.parse(product.features) : undefined,
      specifications: product.specifications
        ? JSON.parse(product.specifications)
        : undefined,
      store: {
        id: store.id,
        name: store.name,
        slug: store.slug,
        logo: store.logo,
        rating: store.rating,
        isVerified: store.verificationStatus === "VERIFIED",
      },
      // Transform images to simple URLs for frontend compatibility
      images: product.images.map((img) => img.url),
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật sản phẩm
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Kiểm tra sản phẩm tồn tại và thuộc store này
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: params.id,
        storeId: store.id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
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
      lowStockThreshold,
      status,
      condition,
      tags = [],
      metaTitle,
      metaDescription,
      metaKeywords,
      features,
      specifications,
      isDigital,
      isFeatured,
      requiresShipping,
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

    // Check if SKU exists for other products in this store
    if (sku && sku !== existingProduct.sku) {
      const existingSku = await prisma.product.findFirst({
        where: {
          sku,
          storeId: store.id,
          id: { not: params.id },
        },
      });

      if (existingSku) {
        return NextResponse.json(
          { error: "SKU already exists in your store" },
          { status: 400 }
        );
      }
    }

    // Generate slug if not provided or different
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

    // Check if slug exists for other products
    if (finalSlug !== existingProduct.slug) {
      const existingSlug = await prisma.product.findFirst({
        where: { slug: finalSlug, id: { not: params.id } },
      });

      if (existingSlug) {
        return NextResponse.json(
          { error: "Slug already exists" },
          { status: 400 }
        );
      }
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        slug: finalSlug,
        description,
        shortDescription,
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
        lowStockThreshold: lowStockThreshold
          ? parseInt(lowStockThreshold)
          : existingProduct.lowStockThreshold,
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
        publishedAt:
          status === "ACTIVE" && !existingProduct.publishedAt
            ? new Date()
            : existingProduct.publishedAt,
      },
    });

    // Update product images
    if (images && images.length > 0) {
      // Delete existing images
      await prisma.productImage.deleteMany({
        where: { productId: params.id },
      });

      // Create new images
      await Promise.all(
        images.map(
          (
            image: { url: string; alt?: string; caption?: string },
            index: number
          ) =>
            prisma.productImage.create({
              data: {
                productId: params.id,
                url: image.url,
                alt: image.alt || updatedProduct.name,
                caption: image.caption,
                order: index,
                isMain: index === 0,
              },
            })
        )
      );
    }

    // Update product variants
    if (variants && variants.length > 0) {
      // Delete existing variants
      await prisma.productVariant.deleteMany({
        where: { productId: params.id },
      });

      // Create new variants
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
                productId: params.id,
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

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Xóa sản phẩm
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Kiểm tra sản phẩm tồn tại và thuộc store này
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: params.id,
        storeId: store.id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if product has any orders
    const hasOrders = await prisma.orderItem.findFirst({
      where: { productId: params.id },
    });

    if (hasOrders) {
      // Soft delete - archive instead of delete
      await prisma.product.update({
        where: { id: params.id },
        data: { status: "INACTIVE" }, // Use INACTIVE instead of ARCHIVED
      });

      return NextResponse.json({
        message: "Product archived successfully (has order history)",
      });
    }

    // Hard delete if no orders
    await prisma.product.delete({
      where: { id: params.id },
    });

    // Update store product count
    await prisma.store.update({
      where: { id: store.id },
      data: {
        totalProducts: {
          decrement: 1,
        },
      },
    });

    return NextResponse.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
