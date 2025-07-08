import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { BrandRegistrationStatus, BrandRegistrationType } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as BrandRegistrationStatus | null;
    const type = searchParams.get("type") as BrandRegistrationType | null;
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const skip = (page - 1) * limit;

    // Build where conditions
    const where: {
      status?: BrandRegistrationStatus;
      type?: BrandRegistrationType;
      brandName?: string;
      companyName?: string;
      OR?: {
        brandName?: { contains: string };
        companyName?: { contains: string };
        store?: {
          name?: { contains: string };
          owner?: {
            name?: { contains: string };
          };
        };
      }[];
    } = {};

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { brandName: { contains: search } },
        { companyName: { contains: search } },
        { store: { name: { contains: search } } },
        { store: { owner: { name: { contains: search } } } },
      ];
    }

    // Get total count
    const total = await prisma.brandRegistration.count({ where });

    // Get registrations with pagination
    const registrations = await prisma.brandRegistration.findMany({
      where,
      include: {
        store: {
          select: {
            id: true,
            name: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
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
      },
      orderBy: [
        { status: "asc" }, // Pending first
        { submittedAt: "desc" },
      ],
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      registrations,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching brand registrations:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi tải danh sách đăng ký" },
      { status: 500 }
    );
  }
}
