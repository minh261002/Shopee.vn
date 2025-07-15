import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// Validation schemas
const createBrandSchema = z.object({
  name: z.string().min(1, "Tên thương hiệu là bắt buộc").max(255),
  slug: z.string().min(1, "Slug là bắt buộc").max(255),
  description: z.string().optional(),
  logo: z.string().url("Logo phải là URL hợp lệ").optional(),
  website: z.string().url("Website phải là URL hợp lệ").optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

const getBrandsSchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  search: z.string().optional(),
  isActive: z.string().optional(),
  isFeatured: z.string().optional(),
  sortBy: z
    .enum(["name", "createdAt", "updatedAt"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// GET /api/admin/brands - Get brands list
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const validatedParams = getBrandsSchema.parse({
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "10",
      search: searchParams.get("search") || undefined,
      isActive: searchParams.get("isActive") || undefined,
      isFeatured: searchParams.get("isFeatured") || undefined,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    });

    const page = parseInt(validatedParams.page);
    const limit = parseInt(validatedParams.limit);
    const offset = (page - 1) * limit;

    // Build where conditions
    const where: Prisma.BrandWhereInput = {};

    if (validatedParams.search) {
      where.OR = [
        { name: { contains: validatedParams.search } },
        { description: { contains: validatedParams.search } },
      ];
    }

    if (validatedParams.isActive !== undefined) {
      where.isActive = validatedParams.isActive === "true";
    }

    if (validatedParams.isFeatured !== undefined) {
      where.isFeatured = validatedParams.isFeatured === "true";
    }

    // Build orderBy
    const orderBy: Prisma.BrandOrderByWithRelationInput = {};
    orderBy[validatedParams.sortBy] = validatedParams.sortOrder;

    // Get brands with pagination
    const [brands, total] = await Promise.all([
      prisma.brand.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      }),
      prisma.brand.count({ where }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      brands,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    });
  } catch (error) {
    console.error("Error fetching brands:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid parameters", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/brands - Create new brand
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createBrandSchema.parse(body);

    // Check if name already exists
    const existingBrandByName = await prisma.brand.findUnique({
      where: { name: validatedData.name },
    });

    if (existingBrandByName) {
      return NextResponse.json(
        { error: "Tên thương hiệu đã tồn tại" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingBrandBySlug = await prisma.brand.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingBrandBySlug) {
      return NextResponse.json({ error: "Slug đã tồn tại" }, { status: 400 });
    }

    // Create brand
    const brand = await prisma.brand.create({
      data: validatedData,
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    console.error("Error creating brand:", error);

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
