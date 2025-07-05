import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

// GET - Lấy danh sách địa chỉ của user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const addresses = await prisma.userAddress.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error("Error fetching user addresses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Thêm địa chỉ mới cho user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { address, lat, lng, type, isDefault } = body;

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    // Nếu địa chỉ này là mặc định, bỏ mặc định của các địa chỉ khác
    if (isDefault) {
      await prisma.userAddress.updateMany({
        where: { userId: id },
        data: { isDefault: false },
      });
    }

    const userAddress = await prisma.userAddress.create({
      data: {
        userId: id,
        address: address as string,
        lat: lat || null,
        lng: lng || null,
        type: type || "HOME",
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json(userAddress);
  } catch (error) {
    console.error("Error creating user address:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
