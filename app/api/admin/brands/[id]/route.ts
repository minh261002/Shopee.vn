import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { z } from "zod";

// Validation schema for updating brand
const updateBrandSchema = z.object({
  name: z.string().min(1, "Tên thương hiệu là bắt buộc").max(255).optional(),
  slug: z.string().min(1, "Slug là bắt buộc").max(255).optional(),
  description: z.string().optional(),
  logo: z.string().url("Logo phải là URL hợp lệ").optional().nullable(),
  website: z.string().url("Website phải là URL hợp lệ").optional().nullable(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

// GET /api/admin/brands/[id] - Get single brand
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const brand = await prisma.brand.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
        products: {
          take: 5,
          select: {
            id: true,
            name: true,
            slug: true,
            originalPrice: true,
            status: true,
            images: {
              take: 1,
              select: {
                url: true,
                alt: true,
              },
            },
          },
        },
      },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json(brand);
  } catch (error) {
    console.error("Error fetching brand:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/brands/[id] - Update brand
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateBrandSchema.parse(body);

    // Check if brand exists
    const existingBrand = await prisma.brand.findUnique({
      where: { id: params.id },
    });

    if (!existingBrand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Check if name already exists (excluding current brand)
    if (validatedData.name && validatedData.name !== existingBrand.name) {
      const existingBrandByName = await prisma.brand.findFirst({
        where: {
          name: validatedData.name,
          id: { not: params.id },
        },
      });

      if (existingBrandByName) {
        return NextResponse.json(
          { error: "Tên thương hiệu đã tồn tại" },
          { status: 400 }
        );
      }
    }

    // Check if slug already exists (excluding current brand)
    if (validatedData.slug && validatedData.slug !== existingBrand.slug) {
      const existingBrandBySlug = await prisma.brand.findFirst({
        where: {
          slug: validatedData.slug,
          id: { not: params.id },
        },
      });

      if (existingBrandBySlug) {
        return NextResponse.json({ error: "Slug đã tồn tại" }, { status: 400 });
      }
    }

    // Update brand
    const updatedBrand = await prisma.brand.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return NextResponse.json(updatedBrand);
  } catch (error) {
    console.error("Error updating brand:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/brands/[id] - Delete brand
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if brand exists
    const existingBrand = await prisma.brand.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!existingBrand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Check if brand has products
    if (existingBrand._count.products > 0) {
      return NextResponse.json(
        {
          error: "Không thể xóa thương hiệu này vì vẫn còn sản phẩm",
          productsCount: existingBrand._count.products,
        },
        { status: 400 }
      );
    }

    // Delete brand
    await prisma.brand.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Brand deleted successfully" });
  } catch (error) {
    console.error("Error deleting brand:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
