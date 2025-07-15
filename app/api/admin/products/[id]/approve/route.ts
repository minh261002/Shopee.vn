import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

// PUT - Phê duyệt sản phẩm
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Kiểm tra sản phẩm tồn tại
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            owner: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Sản phẩm không tồn tại" },
        { status: 404 }
      );
    }

    if (product.status !== "PENDING_APPROVAL") {
      return NextResponse.json(
        { error: "Sản phẩm không ở trạng thái chờ duyệt" },
        { status: 400 }
      );
    }

    // Cập nhật trạng thái sản phẩm thành ACTIVE
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        status: "ACTIVE",
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            owner: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // TODO: Gửi email thông báo cho seller
    // await sendProductApprovedEmail(product.store.owner.email, {
    //   productName: product.name,
    //   storeName: product.store.name,
    //   approvedBy: session.user.name || session.user.email,
    // });

    return NextResponse.json({
      message: "Phê duyệt sản phẩm thành công",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error approving product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
