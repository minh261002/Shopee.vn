import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

// DELETE /api/seller/inventory/locations/[id] - Xóa location
export async function DELETE(
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
      include: {
        _count: {
          select: {
            inventoryItems: true,
            stockMovements: true,
          },
        },
      },
    });

    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    // Kiểm tra xem có thể xóa không
    if (location._count.inventoryItems > 0) {
      return NextResponse.json(
        { error: "Cannot delete location with inventory items" },
        { status: 400 }
      );
    }

    if (location._count.stockMovements > 0) {
      return NextResponse.json(
        { error: "Cannot delete location with stock movements" },
        { status: 400 }
      );
    }

    // Xóa location
    await prisma.inventoryLocation.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({
      message: "Location deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting location:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/seller/inventory/locations/[id] - Cập nhật location
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
    const existingLocation = await prisma.inventoryLocation.findFirst({
      where: {
        id: params.id,
        storeId: storeId,
      },
    });

    if (!existingLocation) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, code, address, lat, lng, isActive } = body;

    // Validation
    if (name && !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (code && !code.trim()) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    // Kiểm tra mã kho đã tồn tại (nếu thay đổi)
    if (code && code !== existingLocation.code) {
      const duplicateLocation = await prisma.inventoryLocation.findFirst({
        where: {
          code: code,
          storeId: storeId,
          id: {
            not: params.id,
          },
        },
      });

      if (duplicateLocation) {
        return NextResponse.json(
          { error: "Location code already exists" },
          { status: 400 }
        );
      }
    }

    // Cập nhật location
    const updatedLocation = await prisma.inventoryLocation.update({
      where: {
        id: params.id,
      },
      data: {
        name: name || undefined,
        code: code || undefined,
        address: address || undefined,
        lat: lat !== undefined ? lat : undefined,
        lng: lng !== undefined ? lng : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    return NextResponse.json({
      location: updatedLocation,
      message: "Location updated successfully",
    });
  } catch (error) {
    console.error("Error updating location:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
