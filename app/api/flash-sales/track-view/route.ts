import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flashSaleId, timestamp, userAgent } = body;

    // Get user session if available
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;

    // Get IP address
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "unknown";

    // Create flash sale view record
    await prisma.flashSaleItemView.create({
      data: {
        flashSaleItemId: flashSaleId, // This will be updated to track individual items
        userId,
        sessionId: session?.session?.id || null,
        ipAddress: ip,
        userAgent: userAgent || "unknown",
        createdAt: new Date(timestamp),
      },
    });

    // Update analytics
    await updateFlashSaleAnalytics(flashSaleId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking flash sale view:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function updateFlashSaleAnalytics(flashSaleId: string) {
  try {
    // Get current analytics or create new one
    let analytics = await prisma.flashSaleAnalytics.findUnique({
      where: { flashSaleId },
    });

    if (!analytics) {
      analytics = await prisma.flashSaleAnalytics.create({
        data: {
          flashSaleId,
          totalViews: 0,
          totalPurchases: 0,
          totalRevenue: 0,
          conversionRate: 0,
          uniqueVisitors: 0,
          returningVisitors: 0,
          avgSessionDuration: 0,
          avgDiscountPercent: 0,
          mobileViews: 0,
          desktopViews: 0,
          tabletViews: 0,
        },
      });
    }

    // Update view count
    await prisma.flashSaleAnalytics.update({
      where: { id: analytics.id },
      data: {
        totalViews: {
          increment: 1,
        },
      },
    });
  } catch (error) {
    console.error("Error updating flash sale analytics:", error);
  }
}
