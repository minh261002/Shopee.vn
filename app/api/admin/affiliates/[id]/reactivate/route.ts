import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

// PUT - Kích hoạt lại affiliate
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

    if (affiliate.status !== "SUSPENDED") {
      return NextResponse.json(
        { error: "Only suspended affiliates can be reactivated" },
        { status: 400 }
      );
    }

    // Reactivate affiliate
    const updatedAffiliate = await prisma.affiliate.update({
      where: {
        id: params.id,
      },
      data: {
        status: "APPROVED",
        rejectionReason: null, // Clear rejection reason
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
    console.error("Reactivate affiliate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
