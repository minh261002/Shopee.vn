import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/shipping/shipments/[id]
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const shipment = await prisma.shipment.findUnique({
      where: { id },
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

    if (!shipment) {
      return NextResponse.json(
        { error: "Shipment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(shipment);
  } catch (error) {
    console.error("Error fetching shipment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/shipping/shipments/[id]
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

    const shipment = await prisma.shipment.update({
      where: { id },
      data: body,
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

    return NextResponse.json(shipment);
  } catch (error) {
    console.error("Error updating shipment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/shipping/shipments/[id]
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.shipment.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Shipment deleted successfully" });
  } catch (error) {
    console.error("Error deleting shipment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
