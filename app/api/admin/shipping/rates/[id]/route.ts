import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/shipping/rates/[id]
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const rate = await prisma.shippingRate.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!rate) {
      return NextResponse.json({ error: "Rate not found" }, { status: 404 });
    }

    return NextResponse.json(rate);
  } catch (error) {
    console.error("Error fetching rate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/shipping/rates/[id]
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

    const rate = await prisma.shippingRate.update({
      where: { id },
      data: body,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return NextResponse.json(rate);
  } catch (error) {
    console.error("Error updating rate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/shipping/rates/[id]
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.shippingRate.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Rate deleted successfully" });
  } catch (error) {
    console.error("Error deleting rate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
