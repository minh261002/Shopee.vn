import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { AffiliateStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") as AffiliateStatus | undefined;
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      OR?: Array<{
        user?: { name: { contains: string } } | { email: { contains: string } };
      }>;
      status?: AffiliateStatus;
    } = {};

    if (search) {
      where.OR = [
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    // Get affiliates with pagination and related data
    const [affiliates, total] = await Promise.all([
      prisma.affiliate.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          _count: {
            select: {
              affiliateLinks: true,
              commissions: true,
              payouts: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.affiliate.count({ where }),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    // Transform data for frontend
    const transformedAffiliates = affiliates.map((affiliate) => ({
      ...affiliate,
      totalReferrals: affiliate._count.affiliateLinks,
      totalCommission: affiliate.totalCommission, // Use the actual field from database
    }));

    return NextResponse.json({
      affiliates: transformedAffiliates,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Get affiliates error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Tạo affiliate mới
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, defaultCommissionRate, applicationNote } = body;

    // Validation
    if (!userId || !defaultCommissionRate) {
      return NextResponse.json(
        { error: "User ID and commission rate are required" },
        { status: 400 }
      );
    }

    // Validate commission rate
    const commissionRate = parseFloat(defaultCommissionRate);
    if (isNaN(commissionRate) || commissionRate < 0 || commissionRate > 100) {
      return NextResponse.json(
        { error: "Commission rate must be between 0 and 100" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if affiliate already exists for this user
    const existingAffiliate = await prisma.affiliate.findUnique({
      where: { userId },
    });

    if (existingAffiliate) {
      return NextResponse.json(
        { error: "Affiliate already exists for this user" },
        { status: 400 }
      );
    }

    const affiliate = await prisma.affiliate.create({
      data: {
        userId,
        defaultCommissionRate: commissionRate,
        applicationNote,
        status: "PENDING",
        totalReferrals: 0,
        totalCommission: 0,
        unpaidCommission: 0,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(affiliate, { status: 201 });
  } catch (error) {
    console.error("Create affiliate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
