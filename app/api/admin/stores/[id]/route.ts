import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

// GET - Lấy thông tin cửa hàng theo ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get store with related data
    const store = await prisma.store.findUnique({
      where: {
        id: params.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Transform data for frontend
    const transformedStore = {
      ...store,
      totalProducts: store._count.products,
      totalOrders: store._count.orders,
      reviewCount: 0, // TODO: Add reviews to schema
      totalRevenue: 0, // TODO: Calculate from orders
    };

    return NextResponse.json(transformedStore);
  } catch (error) {
    console.error("Get store error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật cửa hàng
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get store
    const store = await prisma.store.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Update store
    const body = await req.json();
    const updatedStore = await prisma.store.update({
      where: {
        id: params.id,
      },
      data: {
        name: body.name,
        description: body.description,
        status: body.status,
        type: body.type,
        verificationStatus: body.verificationStatus,
        logo: body.logo,
        banner: body.banner,
        email: body.email,
        phone: body.phone,
        website: body.website,
        businessName: body.businessName,
        businessAddress: body.businessAddress,
        taxCode: body.taxCode,
        businessLicense: body.businessLicense,
        address: body.address,
        lat: body.lat,
        lng: body.lng,
        returnPolicy: body.returnPolicy,
        shippingPolicy: body.shippingPolicy,
        warrantyPolicy: body.warrantyPolicy,

        isFeatured: body.isFeatured,
        isVerified: body.isVerified,
        isOfficialStore: body.isOfficialStore,
        facebookUrl: body.facebookUrl,
        instagramUrl: body.instagramUrl,
        youtubeUrl: body.youtubeUrl,
      },
    });

    return NextResponse.json(updatedStore);
  } catch (error) {
    console.error("Update store error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Xóa cửa hàng
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get store
    const store = await prisma.store.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Delete store
    await prisma.store.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: "Store deleted successfully" });
  } catch (error) {
    console.error("Delete store error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
