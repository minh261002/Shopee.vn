import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

// GET /api/seller/inventory/stats - Lấy thống kê inventory
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

    // Lấy thống kê tổng quan
    const [
      totalLocations,
      totalProducts,
      lowStockItems,
      outOfStockItems,
      recentMovements,
      totalValue,
    ] = await Promise.all([
      // Tổng số kho
      prisma.inventoryLocation.count({
        where: {
          storeId: storeId,
          isActive: true,
        },
      }),
      // Tổng số sản phẩm trong kho
      prisma.inventoryItem.count({
        where: {
          location: {
            storeId: storeId,
          },
        },
      }),
      // Sản phẩm sắp hết hàng
      prisma.inventoryItem.count({
        where: {
          location: {
            storeId: storeId,
          },
          AND: [
            {
              quantity: {
                lte: prisma.inventoryItem.fields.reorderPoint,
              },
            },
            {
              quantity: {
                gt: 0,
              },
            },
          ],
        },
      }),
      // Sản phẩm hết hàng
      prisma.inventoryItem.count({
        where: {
          location: {
            storeId: storeId,
          },
          quantity: 0,
        },
      }),
      // Giao dịch gần đây (7 ngày)
      prisma.stockMovement.count({
        where: {
          location: {
            storeId: storeId,
          },
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Tổng giá trị tồn kho
      prisma.inventoryItem.aggregate({
        where: {
          location: {
            storeId: storeId,
          },
          avgCostPrice: {
            not: null,
          },
        },
        _sum: {
          quantity: true,
        },
        _avg: {
          avgCostPrice: true,
        },
      }),
    ]);

    // Tính tổng giá trị
    const calculatedTotalValue =
      totalValue._sum.quantity && totalValue._avg.avgCostPrice
        ? totalValue._sum.quantity * totalValue._avg.avgCostPrice
        : 0;

    const stats = {
      totalLocations,
      totalProducts,
      lowStockItems,
      outOfStockItems,
      recentMovements,
      totalValue: calculatedTotalValue,
    };

    return NextResponse.json({
      stats,
    });
  } catch (error) {
    console.error("Error fetching inventory stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
