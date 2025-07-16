import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get flash sale with analytics
    const flashSale = await prisma.flashSale.findUnique({
      where: { id },
      include: {
        FlashSaleAnalytics: true,
        flashSaleItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                originalPrice: true,
                salePrice: true,
              },
            },
            views: {
              select: {
                id: true,
                createdAt: true,
                userId: true,
              },
            },
            purchases: {
              select: {
                id: true,
                quantity: true,
                totalPrice: true,
                createdAt: true,
                userId: true,
              },
            },
          },
          orderBy: { priority: "desc" },
        },
      },
    });

    if (!flashSale) {
      return NextResponse.json(
        { error: "Flash sale not found" },
        { status: 404 }
      );
    }

    // Calculate additional analytics
    const analytics = await calculateDetailedAnalytics(id);

    return NextResponse.json({
      flashSale,
      analytics,
    });
  } catch (error) {
    console.error("Error fetching flash sale analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function calculateDetailedAnalytics(flashSaleId: string) {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Get view statistics
  const [totalViews, todayViews, weekViews] = await Promise.all([
    prisma.flashSaleItemView.count({
      where: {
        flashSaleItem: { flashSaleId },
      },
    }),
    prisma.flashSaleItemView.count({
      where: {
        flashSaleItem: { flashSaleId },
        createdAt: { gte: oneDayAgo },
      },
    }),
    prisma.flashSaleItemView.count({
      where: {
        flashSaleItem: { flashSaleId },
        createdAt: { gte: oneWeekAgo },
      },
    }),
  ]);

  // Get purchase statistics
  const [totalPurchases, todayPurchases, weekPurchases] = await Promise.all([
    prisma.flashSaleItemPurchase.count({
      where: {
        flashSaleItem: { flashSaleId },
      },
    }),
    prisma.flashSaleItemPurchase.count({
      where: {
        flashSaleItem: { flashSaleId },
        createdAt: { gte: oneDayAgo },
      },
    }),
    prisma.flashSaleItemPurchase.count({
      where: {
        flashSaleItem: { flashSaleId },
        createdAt: { gte: oneWeekAgo },
      },
    }),
  ]);

  // Get revenue statistics
  const [totalRevenue, todayRevenue, weekRevenue] = await Promise.all([
    prisma.flashSaleItemPurchase.aggregate({
      where: {
        flashSaleItem: { flashSaleId },
      },
      _sum: { totalPrice: true },
    }),
    prisma.flashSaleItemPurchase.aggregate({
      where: {
        flashSaleItem: { flashSaleId },
        createdAt: { gte: oneDayAgo },
      },
      _sum: { totalPrice: true },
    }),
    prisma.flashSaleItemPurchase.aggregate({
      where: {
        flashSaleItem: { flashSaleId },
        createdAt: { gte: oneWeekAgo },
      },
      _sum: { totalPrice: true },
    }),
  ]);

  // Get unique visitors
  const uniqueVisitors = await prisma.flashSaleItemView.groupBy({
    by: ["userId"],
    where: {
      flashSaleItem: { flashSaleId },
      userId: { not: null },
    },
    _count: { userId: true },
  });

  // Calculate conversion rate
  const conversionRate =
    totalViews > 0 ? (totalPurchases / totalViews) * 100 : 0;

  return {
    totalViews,
    todayViews,
    weekViews,
    totalPurchases,
    todayPurchases,
    weekPurchases,
    totalRevenue: totalRevenue._sum.totalPrice || 0,
    todayRevenue: todayRevenue._sum.totalPrice || 0,
    weekRevenue: weekRevenue._sum.totalPrice || 0,
    uniqueVisitors: uniqueVisitors.length,
    conversionRate: Math.round(conversionRate * 100) / 100,
  };
}
