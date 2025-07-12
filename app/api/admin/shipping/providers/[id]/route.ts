import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

// GET - Lấy thông tin nhà vận chuyển
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const provider = await prisma.shippingProvider.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            shippingRates: true,
            shipments: true,
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
    console.error("Error fetching shipping provider:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật nhà vận chuyển
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      code,
      description,
      logo,
      website,
      apiKey,
      apiSecret,
      apiUrl,
      isActive,
    } = body;

    // Check if provider exists
    const existingProvider = await prisma.shippingProvider.findUnique({
      where: { id: params.id },
    });

    if (!existingProvider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    // Check if code already exists (if changed)
    if (code && code !== existingProvider.code) {
      const codeExists = await prisma.shippingProvider.findUnique({
        where: { code },
      });

      if (codeExists) {
        return NextResponse.json(
          { error: "Provider code already exists" },
          { status: 400 }
        );
      }
    }

    // Update provider
    const updatedProvider = await prisma.shippingProvider.update({
      where: { id: params.id },
      data: {
        name,
        code,
        description,
        logo,
        website,
        apiKey,
        apiSecret,
        apiUrl,
        isActive,
      },
    });

    return NextResponse.json(updatedProvider);
  } catch (error) {
    console.error("Error updating shipping provider:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Xóa nhà vận chuyển
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if provider exists
    const provider = await prisma.shippingProvider.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            shippingRates: true,
            shipments: true,
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

    // Check if provider has related data
    if (provider._count.shippingRates > 0 || provider._count.shipments > 0) {
      return NextResponse.json(
        { error: "Cannot delete provider with existing rates or shipments" },
        { status: 400 }
      );
    }

    // Delete provider
    await prisma.shippingProvider.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Provider deleted successfully" });
  } catch (error) {
    console.error("Error deleting shipping provider:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
