import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

// GET /api/admin/shipping/stats
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if we have any providers, if not create some test data
    const providerCount = await prisma.shippingProvider.count();
    if (providerCount === 0) {
      // Create test providers
      await prisma.shippingProvider.createMany({
        data: [
          {
            name: "Giao Hàng Nhanh",
            code: "GHN",
            description: "Dịch vụ giao hàng nhanh toàn quốc",
            isActive: true,
          },
          {
            name: "Giao Hàng Tiết Kiệm",
            code: "GHTK",
            description: "Dịch vụ giao hàng tiết kiệm",
            isActive: true,
          },
          {
            name: "Viettel Post",
            code: "VTP",
            description: "Dịch vụ bưu cục Viettel",
            isActive: true,
          },
        ],
      });
    }

    // Get provider stats
    const [totalProviders, activeProviders] = await Promise.all([
      prisma.shippingProvider.count(),
      prisma.shippingProvider.count({
        where: { isActive: true },
      }),
    ]);

    // Get rate stats
    const [totalRates, activeRates] = await Promise.all([
      prisma.shippingRate.count(),
      prisma.shippingRate.count({
        where: { isActive: true },
      }),
    ]);

    // Get shipment stats
    const [
      totalShipments,
      pendingShipments,
      processingShipments,
      shippedShipments,
      deliveredShipments,
      cancelledShipments,
    ] = await Promise.all([
      prisma.shipment.count(),
      prisma.shipment.count({
        where: { status: "PENDING" },
      }),
      prisma.shipment.count({
        where: { status: "IN_TRANSIT" },
      }),
      prisma.shipment.count({
        where: { status: "OUT_FOR_DELIVERY" },
      }),
      prisma.shipment.count({
        where: { status: "DELIVERED" },
      }),
      prisma.shipment.count({
        where: { status: "FAILED_DELIVERY" },
      }),
    ]);

    // Get revenue stats
    const totalRevenue = await prisma.shipment.aggregate({
      _sum: {
        shippingFee: true,
      },
    });

    // Calculate monthly revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyRevenue = await prisma.shipment.aggregate({
      _sum: {
        shippingFee: true,
      },
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Calculate revenue change (simplified - you might want to compare with previous month)
    const revenueChange = 0; // Placeholder - implement actual calculation

    const stats = {
      totalProviders,
      activeProviders,
      totalRates,
      activeRates,
      totalShipments,
      pendingShipments,
      processingShipments,
      shippedShipments,
      deliveredShipments,
      cancelledShipments,
      totalRevenue: totalRevenue._sum.shippingFee || 0,
      monthlyRevenue: monthlyRevenue._sum.shippingFee || 0,
      revenueChange,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching shipping stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
