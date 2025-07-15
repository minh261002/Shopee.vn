import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

// GET /api/seller/inventory/locations - Lấy danh sách vị trí kho
export async function GET(request: NextRequest) {
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

    const locations = await prisma.inventoryLocation.findMany({
      where: {
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      locations,
    });
  } catch (error) {
    console.error("Error fetching inventory locations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/seller/inventory/locations - Tạo kho mới
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, code, address, lat, lng, isActive } = body;

    // Validation
    if (!name || !code || !address) {
      return NextResponse.json(
        { error: "Name, code and address are required" },
        { status: 400 }
      );
    }

    // Kiểm tra mã kho đã tồn tại
    const existingLocation = await prisma.inventoryLocation.findFirst({
      where: {
        code: code,
        storeId: storeId,
      },
    });

    if (existingLocation) {
      return NextResponse.json(
        { error: "Location code already exists" },
        { status: 400 }
      );
    }

    // Nếu đây là kho đầu tiên, đặt làm mặc định
    const existingLocations = await prisma.inventoryLocation.count({
      where: {
        storeId: storeId,
      },
    });

    const isDefault = existingLocations === 0;

    const location = await prisma.inventoryLocation.create({
      data: {
        name,
        code,
        address,
        lat,
        lng,
        isActive: isActive ?? true,
        isDefault,
        storeId,
      },
    });

    return NextResponse.json({
      location,
      message: "Location created successfully",
    });
  } catch (error) {
    console.error("Error creating inventory location:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
