import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

// GET /api/admin/shipping/providers/top
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get top providers by shipment count and revenue
    const topProviders = await prisma.shipment.groupBy({
      by: ["providerId"],
      _count: { id: true },
      _sum: { shippingFee: true },
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
          revenue: provider._sum.shippingFee || 0,
        };
      })
    );

    return NextResponse.json(topProvidersWithDetails);
  } catch (error) {
    console.error("Error fetching top providers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
