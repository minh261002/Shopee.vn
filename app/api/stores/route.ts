import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { StoreType } from "@prisma/client";
import slugify from "react-slugify";

export async function POST(req: NextRequest) {
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

    if (!session?.user || session.user.role !== "USER") {
      return NextResponse.json(
        { error: "Only users can create stores" },
        { status: 403 }
      );
    }

    // Check if user already has a store
    const existingStore = await prisma.store.findFirst({
      where: {
        ownerId: session.user.id,
      },
    });

    if (existingStore) {
      return NextResponse.json(
        { error: "You already have a store" },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Validate required fields
    const requiredFields = ["name", "phone", "email", "address", "lat", "lng"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Create slug from name
    const slug = slugify(body.name);

    // Check if slug already exists
    const existingSlug = await prisma.store.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: "Store name already exists" },
        { status: 400 }
      );
    }

    // Create store
    const store = await prisma.store.create({
      data: {
        name: body.name,
        slug,
        description: body.description,
        type: body.type || StoreType.INDIVIDUAL,
        ownerId: session.user.id,
        phone: body.phone,
        email: body.email,
        website: body.website,

        // Business info
        businessName: body.businessName,
        businessAddress: body.businessAddress,
        taxCode: body.taxCode,
        businessLicense: body.businessLicense,

        // Location
        address: body.address,
        lat: Number(body.lat),
        lng: Number(body.lng),

        // Policies
        returnPolicy: body.returnPolicy,
        shippingPolicy: body.shippingPolicy,
        warrantyPolicy: body.warrantyPolicy,

        // Social media
        facebookUrl: body.facebookUrl,
        instagramUrl: body.instagramUrl,
        youtubeUrl: body.youtubeUrl,

        // Default values
        isActive: false, // Needs admin approval
        status: "PENDING_APPROVAL",
        verificationStatus: "PENDING",
      },
    });

    // Update user role to SELLER
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: "SELLER" },
    });

    return NextResponse.json({
      message: "Đăng ký cửa hàng thành công. Đang chờ phê duyệt.",
      store,
    });
  } catch (error) {
    console.error("Store creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
