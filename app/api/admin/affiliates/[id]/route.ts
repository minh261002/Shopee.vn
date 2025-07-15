import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

// GET - Lấy thông tin affiliate theo ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get affiliate with related data
    const affiliate = await prisma.affiliate.findUnique({
      where: {
        id: params.id,
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
        affiliateLinks: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                originalPrice: true,
                salePrice: true,
                images: {
                  where: { isMain: true },
                  take: 1,
                },
              },
            },
            store: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
        commissions: {
          include: {
            order: {
              select: {
                id: true,
                orderNumber: true,
                total: true,
                createdAt: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        payouts: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        _count: {
          select: {
            affiliateLinks: true,
            commissions: true,
            payouts: true,
          },
        },
      },
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    // Transform data for frontend
    const transformedAffiliate = {
      ...affiliate,
      totalReferrals: affiliate._count.affiliateLinks,
      totalCommission: affiliate.totalCommission, // Use actual field from database
      unpaidCommission: affiliate.unpaidCommission, // Use actual field from database
    };

    return NextResponse.json(transformedAffiliate);
  } catch (error) {
    console.error("Get affiliate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật affiliate
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get affiliate
    const affiliate = await prisma.affiliate.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    // Update affiliate
    const body = await req.json();

    // Validate commission rate if provided
    if (body.defaultCommissionRate !== undefined) {
      const commissionRate = parseFloat(body.defaultCommissionRate);
      if (isNaN(commissionRate) || commissionRate < 0 || commissionRate > 100) {
        return NextResponse.json(
          { error: "Commission rate must be between 0 and 100" },
          { status: 400 }
        );
      }
      body.defaultCommissionRate = commissionRate;
    }

    const updatedAffiliate = await prisma.affiliate.update({
      where: {
        id: params.id,
      },
      data: {
        defaultCommissionRate: body.defaultCommissionRate,
        bankAccount: body.bankAccount,
        taxCode: body.taxCode,
        paymentEmail: body.paymentEmail,
        applicationNote: body.applicationNote,
        rejectionReason: body.rejectionReason,
        updatedAt: new Date(),
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

    return NextResponse.json(updatedAffiliate);
  } catch (error) {
    console.error("Update affiliate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Xóa affiliate
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if affiliate exists
    const affiliate = await prisma.affiliate.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    // Delete affiliate (this will cascade delete related records)
    await prisma.affiliate.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: "Affiliate deleted successfully" });
  } catch (error) {
    console.error("Delete affiliate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
