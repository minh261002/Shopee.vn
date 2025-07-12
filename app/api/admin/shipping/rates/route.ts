import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { Prisma, ShippingMethod } from "@prisma/client";

// GET - Lấy danh sách biểu giá vận chuyển
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const providerId = searchParams.get("providerId");
    const method = searchParams.get("method");
    const isActive = searchParams.get("isActive");

    // Build where conditions
    const where: Prisma.ShippingRateWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { provider: { name: { contains: search } } },
        { provider: { code: { contains: search } } },
      ];
    }

    if (providerId) {
      where.providerId = providerId;
    }

    if (method) {
      where.method = method as ShippingMethod;
    }

    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    // Get rates with provider info
    const rates = await prisma.shippingRate.findMany({
      where,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: [{ provider: { name: "asc" } }, { name: "asc" }],
    });

    return NextResponse.json({ rates });
  } catch (error) {
    console.error("Error fetching shipping rates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Tạo biểu giá mới
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      providerId,
      method,
      name,
      fromCity,
      toCity,
      basePrice,
      perKgPrice,
      freeShippingThreshold,
      estimatedDays,
      minWeight,
      maxWeight,
      minValue,
      maxValue,
    } = body;

    // Validation
    if (!providerId || !method || !name || !basePrice || !estimatedDays) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if provider exists
    const provider = await prisma.shippingProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 400 }
      );
    }

    // Create rate
    const rate = await prisma.shippingRate.create({
      data: {
        providerId,
        method,
        name,
        fromCity,
        toCity,
        basePrice: parseFloat(basePrice),
        perKgPrice: parseFloat(perKgPrice) || 0,
        freeShippingThreshold: freeShippingThreshold
          ? parseFloat(freeShippingThreshold)
          : null,
        estimatedDays: parseInt(estimatedDays),
        minWeight: minWeight ? parseFloat(minWeight) : null,
        maxWeight: maxWeight ? parseFloat(maxWeight) : null,
        minValue: minValue ? parseFloat(minValue) : null,
        maxValue: maxValue ? parseFloat(maxValue) : null,
        isActive: true,
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return NextResponse.json(rate);
  } catch (error) {
    console.error("Error creating shipping rate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
