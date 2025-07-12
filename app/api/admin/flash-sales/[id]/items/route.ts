import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { headers } from "next/headers";

const flashSaleItemSchema = z.object({
  productId: z.string().min(1, "Sản phẩm là bắt buộc"),
  originalPrice: z.number().min(0, "Giá gốc phải lớn hơn 0"),
  salePrice: z.number().min(0, "Giá khuyến mãi phải lớn hơn 0"),
  discountPercent: z
    .number()
    .min(0)
    .max(100, "Phần trăm giảm giá phải từ 0-100"),
  totalQuantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
  maxPerUser: z.number().min(1, "Giới hạn mỗi user phải lớn hơn 0"),
  priority: z.number().min(0).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

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

    const items = await prisma.flashSaleItem.findMany({
      where: { flashSaleId: id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            originalPrice: true,
            salePrice: true,
            images: {
              where: { isMain: true },
              take: 1,
            },
          },
        },
      },
      orderBy: { priority: "desc" },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching flash sale items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = flashSaleItemSchema.parse(body);

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

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if item already exists in this flash sale
    const existingItem = await prisma.flashSaleItem.findUnique({
      where: {
        flashSaleId_productId: {
          flashSaleId: id,
          productId: validatedData.productId,
        },
      },
    });

    if (existingItem) {
      return NextResponse.json(
        { error: "Product already exists in this flash sale" },
        { status: 400 }
      );
    }

    // Validate sale price
    if (validatedData.salePrice >= validatedData.originalPrice) {
      return NextResponse.json(
        { error: "Giá khuyến mãi phải nhỏ hơn giá gốc" },
        { status: 400 }
      );
    }

    // Calculate discount percent
    const calculatedDiscount = Math.round(
      ((validatedData.originalPrice - validatedData.salePrice) /
        validatedData.originalPrice) *
        100
    );

    if (calculatedDiscount !== validatedData.discountPercent) {
      return NextResponse.json(
        { error: "Phần trăm giảm giá không khớp với giá" },
        { status: 400 }
      );
    }

    const flashSaleItem = await prisma.flashSaleItem.create({
      data: {
        flashSaleId: id,
        productId: validatedData.productId,
        originalPrice: validatedData.originalPrice,
        salePrice: validatedData.salePrice,
        discountPercent: validatedData.discountPercent,
        totalQuantity: validatedData.totalQuantity,
        remainingQuantity: validatedData.totalQuantity,
        maxPerUser: validatedData.maxPerUser,
        priority: validatedData.priority || 0,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            images: {
              where: { isMain: true },
              take: 1,
            },
          },
        },
      },
    });

    return NextResponse.json(flashSaleItem, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating flash sale item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
