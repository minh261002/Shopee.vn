import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Get session
    const sessionResponse = await fetch(
      `${req.nextUrl.origin}/api/auth/session`,
      {
        headers: {
          cookie: req.headers.get("cookie") || "",
        },
      }
    );

    if (!sessionResponse.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await sessionResponse.json();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get store
    const store = await prisma.store.findFirst({
      where: {
        ownerId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        status: true,
        type: true,
        verificationStatus: true,
        logo: true,
        banner: true,
        email: true,
        phone: true,
        website: true,
        businessName: true,
        businessAddress: true,
        taxCode: true,
        businessLicense: true,
        address: true,
        ward: true,
        city: true,
        country: true,
        lat: true,
        lng: true,
        totalProducts: true,
        totalOrders: true,
        totalRevenue: true,
        rating: true,
        reviewCount: true,
        followerCount: true,
        returnPolicy: true,
        shippingPolicy: true,
        warrantyPolicy: true,
        isActive: true,
        isFeatured: true,
        isVerified: true,
        isOfficialStore: true,
        facebookUrl: true,
        instagramUrl: true,
        youtubeUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    return NextResponse.json(store);
  } catch (error) {
    console.error("Get store error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
