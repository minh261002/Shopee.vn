import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

// GET - Debug endpoint to check product statuses
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get count by status
    const statusCounts = await prisma.product.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    // Get some sample products with PENDING_APPROVAL status
    const pendingProducts = await prisma.product.findMany({
      where: {
        status: "PENDING_APPROVAL",
      },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
      },
      take: 5,
    });

    return NextResponse.json({
      statusCounts,
      pendingProducts,
      totalProducts: await prisma.product.count(),
    });
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
