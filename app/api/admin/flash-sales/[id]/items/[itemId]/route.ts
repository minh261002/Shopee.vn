import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { headers } from "next/headers";

const updateFlashSaleItemSchema = z.object({
  originalPrice: z.number().min(0, "Giá gốc phải lớn hơn 0").optional(),
  salePrice: z.number().min(0, "Giá khuyến mãi phải lớn hơn 0").optional(),
  discountPercent: z
    .number()
    .min(0)
    .max(100, "Phần trăm giảm giá phải từ 0-100")
    .optional(),
  totalQuantity: z.number().min(1, "Số lượng phải lớn hơn 0").optional(),
  maxPerUser: z.number().min(1, "Giới hạn mỗi user phải lớn hơn 0").optional(),
  priority: z.number().min(0).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, itemId } = await params;

    // Check if flash sale exists
    const flashSale = await prisma.flashSale.findUnique({
      where: { id },
    });

    if (!flashSale) {
      return NextResponse.json(
        { error: "Flash sale not found" },
        { status: 404 }
      );
    }

    const item = await prisma.flashSaleItem.findUnique({
      where: { id: itemId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            originalPrice: true,
            salePrice: true,
            stock: true,
            images: {
              where: { isMain: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Flash sale item not found" },
        { status: 404 }
      );
    }

    // Verify the item belongs to the specified flash sale
    if (item.flashSaleId !== id) {
      return NextResponse.json(
        { error: "Flash sale item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Error fetching flash sale item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, itemId } = await params;
    const body = await request.json();
    const validatedData = updateFlashSaleItemSchema.parse(body);

    // Check if flash sale exists
    const flashSale = await prisma.flashSale.findUnique({
      where: { id },
    });

    if (!flashSale) {
      return NextResponse.json(
        { error: "Flash sale not found" },
        { status: 404 }
      );
    }

    const item = await prisma.flashSaleItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Flash sale item not found" },
        { status: 404 }
      );
    }

    // Verify the item belongs to the specified flash sale
    if (item.flashSaleId !== id) {
      return NextResponse.json(
        { error: "Flash sale item not found" },
        { status: 404 }
      );
    }

    // If updating prices, validate them
    if (
      validatedData.originalPrice !== undefined ||
      validatedData.salePrice !== undefined
    ) {
      const originalPrice = validatedData.originalPrice ?? item.originalPrice;
      const salePrice = validatedData.salePrice ?? item.salePrice;

      if (salePrice >= originalPrice) {
        return NextResponse.json(
          { error: "Giá khuyến mãi phải nhỏ hơn giá gốc" },
          { status: 400 }
        );
      }

      // Calculate discount percent
      const calculatedDiscount = Math.round(
        ((originalPrice - salePrice) / originalPrice) * 100
      );

      if (
        validatedData.discountPercent !== undefined &&
        calculatedDiscount !== validatedData.discountPercent
      ) {
        return NextResponse.json(
          { error: "Phần trăm giảm giá không khớp với giá" },
          { status: 400 }
        );
      }

      // Update discount percent if not provided
      if (validatedData.discountPercent === undefined) {
        validatedData.discountPercent = calculatedDiscount;
      }
    }

    // If updating total quantity, update remaining quantity accordingly
    let remainingQuantity = item.remainingQuantity;
    if (validatedData.totalQuantity !== undefined) {
      const soldQuantity = item.totalQuantity - item.remainingQuantity;
      remainingQuantity = Math.max(
        0,
        validatedData.totalQuantity - soldQuantity
      );
    }

    const updatedItem = await prisma.flashSaleItem.update({
      where: { id: itemId },
      data: {
        ...validatedData,
        remainingQuantity,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            originalPrice: true,
            salePrice: true,
            stock: true,
            images: {
              where: { isMain: true },
              take: 1,
            },
          },
        },
      },
    });

    return NextResponse.json({ item: updatedItem });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating flash sale item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, itemId } = await params;

    // Check if flash sale exists
    const flashSale = await prisma.flashSale.findUnique({
      where: { id },
    });

    if (!flashSale) {
      return NextResponse.json(
        { error: "Flash sale not found" },
        { status: 404 }
      );
    }

    const item = await prisma.flashSaleItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Flash sale item not found" },
        { status: 404 }
      );
    }

    // Verify the item belongs to the specified flash sale
    if (item.flashSaleId !== id) {
      return NextResponse.json(
        { error: "Flash sale item not found" },
        { status: 404 }
      );
    }

    await prisma.flashSaleItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({
      message: "Flash sale item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting flash sale item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
