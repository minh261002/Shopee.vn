import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

// GET - Lấy thông tin chi tiết sản phẩm cho admin
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
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
            orderItems: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Sản phẩm không tồn tại" },
        { status: 404 }
      );
    }

    // Transform the product data for frontend
    const transformedProduct = {
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
      // Parse variant attributes
      variants: product.variants.map((variant) => ({
        ...variant,
        attributes: variant.attributes ? JSON.parse(variant.attributes) : {},
      })),
    };

    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
