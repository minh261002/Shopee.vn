import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

// PUT - Từ chối affiliate
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

    if (affiliate.status !== "PENDING") {
      return NextResponse.json(
        { error: "Affiliate is not in pending status" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { rejectionReason } = body;

    // Reject affiliate
    const updatedAffiliate = await prisma.affiliate.update({
      where: {
        id: params.id,
      },
      data: {
        status: "REJECTED",
        rejectionReason: rejectionReason || "Không đủ điều kiện",
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
    console.error("Reject affiliate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
