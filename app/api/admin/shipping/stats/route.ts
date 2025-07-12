import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

// GET - Lấy thống kê vận chuyển
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get provider stats
    const [totalProviders, activeProviders] = await Promise.all([
      prisma.shippingProvider.count(),
      prisma.shippingProvider.count({ where: { isActive: true } }),
    ]);

    // Get rate stats
    const [totalRates, activeRates] = await Promise.all([
      prisma.shippingRate.count(),
      prisma.shippingRate.count({ where: { isActive: true } }),
    ]);

    // Get shipment stats
    const [
      totalShipments,
      deliveredShipments,
      inTransitShipments,
      pendingShipments,
    ] = await Promise.all([
      prisma.shipment.count(),
      prisma.shipment.count({ where: { status: "DELIVERED" } }),
      prisma.shipment.count({
        where: {
          status: { in: ["IN_TRANSIT", "OUT_FOR_DELIVERY"] },
        },
      }),
      prisma.shipment.count({
        where: {
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      }),
    ]);

    // Get revenue stats
    const [totalRevenue, monthlyRevenue] = await Promise.all([
      prisma.shipment.aggregate({
        _sum: { totalFee: true },
      }),
      prisma.shipment.aggregate({
        _sum: { totalFee: true },
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    // Get recent shipments
    const recentShipments = await prisma.shipment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
          },
        },
      },
    });

    // Get top providers
    const topProviders = await prisma.shipment.groupBy({
      by: ["providerId"],
      _count: { id: true },
      _sum: { totalFee: true },
      orderBy: {
        _count: { id: "desc" },
      },
      take: 5,
    });

    // Get provider details for top providers
    const topProvidersWithDetails = await Promise.all(
      topProviders.map(async (provider) => {
        const providerDetails = await prisma.shippingProvider.findUnique({
          where: { id: provider.providerId },
          select: {
            id: true,
            name: true,
            code: true,
          },
        });

        return {
          id: provider.providerId,
          name: providerDetails?.name || "Unknown",
          code: providerDetails?.code || "UNKNOWN",
          shipmentCount: provider._count.id,
          revenue: provider._sum.totalFee || 0,
        };
      })
    );

    const stats = {
      totalProviders,
      activeProviders,
      totalRates,
      activeRates,
      totalShipments,
      deliveredShipments,
      inTransitShipments,
      pendingShipments,
      totalRevenue: totalRevenue._sum.totalFee || 0,
      monthlyRevenue: monthlyRevenue._sum.totalFee || 0,
      recentShipments,
      topProviders: topProvidersWithDetails,
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
