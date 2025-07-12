import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { Prisma, ShippingStatus, ShippingMethod } from "@prisma/client";

// GET - Lấy danh sách đơn hàng vận chuyển
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const providerId = searchParams.get("providerId");
    const status = searchParams.get("status");
    const method = searchParams.get("method");

    // Build where conditions
    const where: Prisma.ShipmentWhereInput = {};

    if (search) {
      where.OR = [
        { order: { orderNumber: { contains: search } } },
        { provider: { name: { contains: search } } },
        { trackingNumber: { contains: search } },
        { deliveryAddress: { contains: search } },
      ];
    }

    if (providerId) {
      where.providerId = providerId;
    }

    if (status) {
      where.status = status as ShippingStatus;
    }

    if (method) {
      where.method = method as ShippingMethod;
    }

    // Get shipments with related data
    const shipments = await prisma.shipment.findMany({
      where,
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
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ shipments });
  } catch (error) {
    console.error("Error fetching shipments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Tạo đơn hàng vận chuyển mới
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      orderId,
      providerId,
      method,
      pickupAddress,
      deliveryAddress,
      weight,
      shippingFee,
      codFee,
      insuranceFee,
      specialInstructions,
      deliveryNote,
    } = body;

    // Validation
    if (
      !orderId ||
      !providerId ||
      !method ||
      !pickupAddress ||
      !deliveryAddress ||
      !shippingFee
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 400 });
    }

    // Check if provider exists
    const provider = await prisma.shippingProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 400 }
      );
    }

    // Check if shipment already exists for this order
    const existingShipment = await prisma.shipment.findUnique({
      where: { orderId },
    });

    if (existingShipment) {
      return NextResponse.json(
        { error: "Shipment already exists for this order" },
        { status: 400 }
      );
    }

    // Calculate total fee
    const totalFee = shippingFee + (codFee || 0) + (insuranceFee || 0);

    // Create shipment
    const shipment = await prisma.shipment.create({
      data: {
        orderId,
        providerId,
        method,
        status: "PENDING",
        pickupAddress,
        deliveryAddress,
        weight: weight ? parseFloat(weight) : null,
        shippingFee: parseFloat(shippingFee),
        codFee: codFee ? parseFloat(codFee) : null,
        insuranceFee: insuranceFee ? parseFloat(insuranceFee) : null,
        totalFee,
        specialInstructions,
        deliveryNote,
      },
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
            status: true,
          },
        },
      },
    });

    return NextResponse.json(shipment);
  } catch (error) {
    console.error("Error creating shipment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
