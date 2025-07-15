import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { PromotionStatus, PromotionType } from "@prisma/client";

// Helper: kiểm tra quyền sở hữu promotion
async function getPromotionAndCheck(
  req: NextRequest,
  id: string,
  userId: string
) {
  // Lấy promotion và store
  const promo = await prisma.storePromotion.findUnique({ where: { id } });
  if (!promo) return { error: "Promotion not found", status: 404 };
  const store = await prisma.store.findFirst({
    where: { id: promo.storeId, ownerId: userId },
  });
  if (!store) return { error: "Unauthorized", status: 403 };
  return { promo };
}

// GET - Chi tiết promotion
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = params;
    const check = await getPromotionAndCheck(request, id, session.user.id);
    if (check.error)
      return NextResponse.json(
        { error: check.error },
        { status: check.status }
      );
    return NextResponse.json(check.promo);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật promotion
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = params;
    const check = await getPromotionAndCheck(request, id, session.user.id);
    if (check.error)
      return NextResponse.json(
        { error: check.error },
        { status: check.status }
      );
    const data = await request.json();
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
    const updated = await prisma.storePromotion.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        type: data.type as PromotionType,
        status: data.status as PromotionStatus,
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
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Xóa promotion
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = params;
    const check = await getPromotionAndCheck(request, id, session.user.id);
    if (check.error)
      return NextResponse.json(
        { error: check.error },
        { status: check.status }
      );
    await prisma.storePromotion.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
