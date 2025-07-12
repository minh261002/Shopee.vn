import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { Prisma } from "@prisma/client";

// GET - Lấy danh sách nhà vận chuyển
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
    const isActive = searchParams.get("isActive");

    // Build where conditions
    const where: Prisma.ShippingProviderWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    // Get providers with counts
    const providers = await prisma.shippingProvider.findMany({
      where,
      include: {
        _count: {
          select: {
            shippingRates: true,
            shipments: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ providers });
  } catch (error) {
    console.error("Error fetching shipping providers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Tạo nhà vận chuyển mới
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
      name,
      code,
      description,
      logo,
      website,
      apiKey,
      apiSecret,
      apiUrl,
    } = body;

    // Validation
    if (!name || !code) {
      return NextResponse.json(
        { error: "Name and code are required" },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existingProvider = await prisma.shippingProvider.findUnique({
      where: { code },
    });

    if (existingProvider) {
      return NextResponse.json(
        { error: "Provider code already exists" },
        { status: 400 }
      );
    }

    // Create provider
    const provider = await prisma.shippingProvider.create({
      data: {
        name,
        code,
        description,
        logo,
        website,
        apiKey,
        apiSecret,
        apiUrl,
        isActive: true,
      },
    });

    return NextResponse.json(provider);
  } catch (error) {
    console.error("Error creating shipping provider:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
