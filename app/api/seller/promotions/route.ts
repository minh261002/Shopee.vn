import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { PromotionStatus, PromotionType } from "@prisma/client";

// GET - Lấy danh sách khuyến mãi của seller
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
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
      where: { id: storeId, ownerId: session.user.id },
    });
    if (!store) {
      return NextResponse.json(
        { error: "Store not found or unauthorized" },
        { status: 404 }
      );
    }

    // Lọc
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const q = searchParams.get("q");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: Partial<Record<string, unknown>> = { storeId: store.id };
    if (status) where.status = status as PromotionStatus;
    if (type) where.type = type as PromotionType;
    if (q) where.name = { contains: q, mode: "insensitive" } as unknown;

    const total = await prisma.storePromotion.count({ where });
    const promotions = await prisma.storePromotion.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    return NextResponse.json({
      promotions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Tạo mới khuyến mãi
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const data = await request.json();
    const storeId = data.storeId;
    if (!storeId) {
      return NextResponse.json(
        { error: "storeId is required" },
        { status: 400 }
      );
    }
    // Kiểm tra store có thuộc về seller này không
    const store = await prisma.store.findFirst({
      where: { id: storeId, ownerId: session.user.id },
    });
    if (!store) {
      return NextResponse.json(
        { error: "Store not found or unauthorized" },
        { status: 404 }
      );
    }
    // Validate cơ bản
    if (
      !data.name ||
      !data.type ||
      !data.startDate ||
      !data.endDate ||
      !data.discountValue
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const promo = await prisma.storePromotion.create({
      data: {
        storeId: store.id,
        name: data.name,
        description: data.description,
        type: data.type,
        status: data.status || "DRAFT",
        discountValue: data.discountValue,
        minOrderAmount: data.minOrderAmount,
        maxDiscountAmount: data.maxDiscountAmount,
        usageLimit: data.usageLimit,
        usagePerUser: data.usagePerUser,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        conditions: data.conditions,
        couponCode: data.couponCode,
      },
    });
    return NextResponse.json(promo, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
