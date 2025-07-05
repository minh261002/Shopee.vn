import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

// PUT - Cập nhật địa chỉ
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; addressId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, addressId } = await params;
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
        where: {
          userId: id,
          id: { not: addressId },
        },
        data: { isDefault: false },
      });
    }

    const userAddress = await prisma.userAddress.update({
      where: { id: addressId },
      data: {
        address: address as string,
        lat: lat || null,
        lng: lng || null,
        type: type || "HOME",
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json(userAddress);
  } catch (error) {
    console.error("Error updating user address:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Xóa địa chỉ
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; addressId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { addressId } = await params;

    await prisma.userAddress.delete({
      where: { id: addressId },
    });

    return NextResponse.json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error("Error deleting user address:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
