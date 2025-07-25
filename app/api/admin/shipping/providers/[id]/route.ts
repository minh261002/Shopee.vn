import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/shipping/providers/[id]
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const provider = await prisma.shippingProvider.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            shippingRates: true,
            shipments: true,
          },
        },
        shippingRates: {
          select: {
            id: true,
            name: true,
            method: true,
            basePrice: true,
            perKgPrice: true,
            estimatedDays: true,
            isActive: true,
          },
        },
        shipments: {
          take: 5,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            orderId: true,
            status: true,
            trackingNumber: true,
            shippingFee: true,
            createdAt: true,
            order: {
              select: {
                orderNumber: true,
              },
            },
          },
        },
      },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(provider);
  } catch (error) {
    console.error("Error fetching provider:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/shipping/providers/[id]
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const provider = await prisma.shippingProvider.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(provider);
  } catch (error) {
    console.error("Error updating provider:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/shipping/providers/[id]
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.shippingProvider.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Provider deleted successfully" });
  } catch (error) {
    console.error("Error deleting provider:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
