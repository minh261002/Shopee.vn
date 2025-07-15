import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

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
    const affiliateId = searchParams.get("affiliateId");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      affiliateId?: string;
      status?: string;
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
    } = {};

    if (affiliateId) {
      where.affiliateId = affiliateId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    try {
      // Get commissions with pagination and related data
      const [commissions, total] = await Promise.all([
        prisma.affiliateCommission.findMany({
          where,
          skip,
          take: limit,
          include: {
            affiliate: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            order: {
              select: {
                id: true,
                orderNumber: true,
                total: true,
                createdAt: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            link: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    originalPrice: true,
                    salePrice: true,
                  },
                },
                store: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.affiliateCommission.count({ where }),
      ]);

      // Calculate total pages
      const totalPages = Math.ceil(total / limit);

      // Calculate summary stats
      const totalCommission = commissions.reduce(
        (sum, commission) => sum + commission.commissionAmount,
        0
      );
      const pendingCommission = commissions
        .filter((commission) => commission.status === "pending")
        .reduce((sum, commission) => sum + commission.commissionAmount, 0);
      const paidCommission = commissions
        .filter((commission) => commission.status === "paid")
        .reduce((sum, commission) => sum + commission.commissionAmount, 0);

      return NextResponse.json({
        commissions,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
        stats: {
          totalCommission,
          pendingCommission,
          paidCommission,
        },
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      // Return empty data if there are no commissions or related data
      return NextResponse.json({
        commissions: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
        stats: {
          totalCommission: 0,
          pendingCommission: 0,
          paidCommission: 0,
        },
      });
    }
  } catch (error) {
    console.error("Get commissions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
