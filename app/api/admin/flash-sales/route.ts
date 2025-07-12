import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { headers } from "next/headers";

const flashSaleSchema = z.object({
  name: z.string().min(1, "Tên flash sale là bắt buộc"),
  description: z.string().optional(),
  bannerImage: z.string().optional(),
  startTime: z.string().min(1, "Thời gian bắt đầu là bắt buộc"),
  endTime: z.string().min(1, "Thời gian kết thúc là bắt buộc"),
  maxQuantityPerUser: z.number().min(1).optional(),
  minOrderAmount: z.number().min(0).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get flash sales with pagination
    const [flashSales, total] = await Promise.all([
      prisma.flashSale.findMany({
        where,
        include: {
          flashSaleItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: {
                    where: { isMain: true },
                    take: 1,
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.flashSale.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      flashSales,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching flash sales:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = flashSaleSchema.parse(body);

    // Validate dates
    const startTime = new Date(validatedData.startTime);
    const endTime = new Date(validatedData.endTime);

    if (startTime >= endTime) {
      return NextResponse.json(
        { error: "Thời gian kết thúc phải sau thời gian bắt đầu" },
        { status: 400 }
      );
    }

    // Determine status based on dates
    const now = new Date();
    let status: "UPCOMING" | "ACTIVE" | "ENDED" = "UPCOMING";

    if (now >= startTime && now <= endTime) {
      status = "ACTIVE";
    } else if (now > endTime) {
      status = "ENDED";
    }

    const flashSale = await prisma.flashSale.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        bannerImage: validatedData.bannerImage,
        startTime,
        endTime,
        maxQuantityPerUser: validatedData.maxQuantityPerUser,
        minOrderAmount: validatedData.minOrderAmount,
        status,
      },
    });

    return NextResponse.json(flashSale, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating flash sale:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
