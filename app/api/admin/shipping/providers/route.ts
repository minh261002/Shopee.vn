import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

// GET /api/admin/shipping/providers
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if we have any providers, if not create some test data
    const providerCount = await prisma.shippingProvider.count();
    if (providerCount === 0) {
      // Create test providers
      await prisma.shippingProvider.createMany({
        data: [
          {
            name: "Giao Hàng Nhanh",
            code: "GHN",
            description: "Dịch vụ giao hàng nhanh toàn quốc",
            isActive: true,
          },
          {
            name: "Giao Hàng Tiết Kiệm",
            code: "GHTK",
            description: "Dịch vụ giao hàng tiết kiệm",
            isActive: true,
          },
          {
            name: "Viettel Post",
            code: "VTP",
            description: "Dịch vụ bưu cục Viettel",
            isActive: true,
          },
        ],
      });
    }

    const providers = await prisma.shippingProvider.findMany({
      include: {
        _count: {
          select: {
            shippingRates: true,
            shipments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
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

// POST /api/admin/shipping/providers
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      code,
      description,
      logo,
      website,
      apiKey,
      apiSecret,
      apiUrl,
      isActive,
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

    const provider = await prisma.shippingProvider.create({
      data: {
        name,
        code: code.toUpperCase(),
        description,
        logo,
        website,
        apiKey,
        apiSecret,
        apiUrl,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(provider, { status: 201 });
  } catch (error) {
    console.error("Error creating shipping provider:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
