import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

// PATCH /api/seller/inventory/locations/[id]/default - Đặt location làm mặc định
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID is required" },
        { status: 400 }
      );
    }

    // Kiểm tra quyền truy cập store
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        ownerId: session.user.id,
      },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Kiểm tra location tồn tại và thuộc về store
    const location = await prisma.inventoryLocation.findFirst({
      where: {
        id: params.id,
        storeId: storeId,
      },
    });

    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    // Bỏ mặc định tất cả location khác
    await prisma.inventoryLocation.updateMany({
      where: {
        storeId: storeId,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });

    // Đặt location này làm mặc định
    const updatedLocation = await prisma.inventoryLocation.update({
      where: {
        id: params.id,
      },
      data: {
        isDefault: true,
      },
    });

    return NextResponse.json({
      location: updatedLocation,
      message: "Location set as default successfully",
    });
  } catch (error) {
    console.error("Error setting default location:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
