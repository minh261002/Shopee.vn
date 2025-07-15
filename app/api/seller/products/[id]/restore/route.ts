import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

// POST - Khôi phục sản phẩm đã bị ẩn
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json(
        { error: "storeId is required" },
        { status: 400 }
      );
    }

    // Kiểm tra store có thuộc về seller này không
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        ownerId: session.user.id,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found or unauthorized" },
        { status: 404 }
      );
    }

    const resolvedParams = await params;

    // Kiểm tra sản phẩm tồn tại và thuộc store này
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: resolvedParams.id,
        storeId: store.id,
        status: "INACTIVE", // Only restore inactive products
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found or not inactive" },
        { status: 404 }
      );
    }

    // Restore product to DRAFT status
    const restoredProduct = await prisma.product.update({
      where: { id: resolvedParams.id },
      data: {
        status: "DRAFT",
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        images: {
          orderBy: { order: "asc" },
        },
        variants: {
          where: { isActive: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json({
      product: restoredProduct,
      message: "Sản phẩm đã được khôi phục thành công",
    });
  } catch (error) {
    console.error("Error restoring product:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi khôi phục sản phẩm" },
      { status: 500 }
    );
  }
}
