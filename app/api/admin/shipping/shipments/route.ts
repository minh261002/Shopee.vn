import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

// GET /api/admin/shipping/shipments
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const providerId = searchParams.get("providerId");
    const limit = searchParams.get("limit");

    const shipments = await prisma.shipment.findMany({
      where: providerId ? { providerId } : undefined,
      include: {
        order: {
          select: {
            orderNumber: true,
            total: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit ? parseInt(limit) : undefined,
    });

    // Transform data to match frontend expectations
    const transformedShipments = shipments.map((shipment) => ({
      id: shipment.id,
      order: {
        orderNumber: shipment.order.orderNumber,
        totalAmount: shipment.order.total,
      },
      provider: {
        name: shipment.provider.name,
      },
      status: shipment.status.toLowerCase(),
      shippingFee: shipment.shippingFee,
      createdAt: shipment.createdAt.toISOString(),
    }));

    return NextResponse.json(transformedShipments);
  } catch (error) {
    console.error("Error fetching shipments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/shipping/shipments
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, providerId, method, trackingNumber, shippingFee, status } =
      body;

    // Validation
    if (!orderId || !providerId || !method) {
      return NextResponse.json(
        { error: "OrderId, providerId, and method are required" },
        { status: 400 }
      );
    }

    if (shippingFee < 0) {
      return NextResponse.json(
        { error: "Shipping fee cannot be negative" },
        { status: 400 }
      );
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if provider exists
    const provider = await prisma.shippingProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }
    const shipment = await prisma.shipment.create({
      data: {
        method,
        status: status || "PENDING",
        trackingNumber,
        shippingFee: shippingFee || 0,
        totalFee: order.total,
        pickupAddress: order.shippingAddress,
        deliveryAddress: order.shippingAddress,
        pickupPhone: order.shippingPhone,
        deliveryPhone: order.shippingPhone,
        order: {
          connect: {
            id: orderId,
          },
        },
        provider: {
          connect: {
            id: providerId,
          },
        },
      },
      include: {
        order: {
          select: {
            orderNumber: true,
            total: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return NextResponse.json(shipment, { status: 201 });
  } catch (error) {
    console.error("Error creating shipment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
