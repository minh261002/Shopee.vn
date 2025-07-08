import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { z } from "zod";
import { BrandRegistrationStatus } from "@prisma/client";

const reviewSchema = z.object({
  action: z.enum(["approve", "reject", "request_resubmission"]),
  reviewNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, reviewNotes, rejectionReason } = reviewSchema.parse(body);

    // Get the registration
    const registration = await prisma.brandRegistration.findUnique({
      where: { id: params.id },
      include: {
        store: {
          include: {
            owner: true,
          },
        },
      },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Không tìm thấy đăng ký thương hiệu" },
        { status: 404 }
      );
    }

    if (registration.status !== "PENDING") {
      return NextResponse.json(
        { error: "Đăng ký này đã được xử lý rồi" },
        { status: 400 }
      );
    }

    // Validate rejection reason for reject/resubmission actions
    if (
      (action === "reject" || action === "request_resubmission") &&
      !rejectionReason?.trim()
    ) {
      return NextResponse.json(
        { error: "Vui lòng nhập lý do từ chối hoặc yêu cầu nộp lại" },
        { status: 400 }
      );
    }

    const updateData: {
      status: BrandRegistrationStatus;
      reviewerId: string | null;
      reviewNotes: string | null;
      reviewedAt: Date;
      rejectionReason: string | null;
      brandId?: string;
    } = {
      status:
        action === "approve"
          ? "APPROVED"
          : action === "reject"
            ? "REJECTED"
            : "RESUBMISSION",
      reviewerId: session.user.id,
      reviewNotes: reviewNotes || null,
      reviewedAt: new Date(),
      rejectionReason: null,
    };

    if (rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    // If approving, also create the brand
    let brand = null;
    if (action === "approve") {
      // Check if brand with same name already exists
      const existingBrand = await prisma.brand.findFirst({
        where: {
          name: registration.brandName,
        },
      });

      if (existingBrand) {
        // Link to existing brand
        updateData.brandId = existingBrand.id;
        brand = existingBrand;
      } else {
        // Create new brand
        brand = await prisma.brand.create({
          data: {
            name: registration.brandName,
            slug: registration.brandName
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/[^a-z0-9\s-]/g, "")
              .replace(/\s+/g, "-")
              .replace(/-+/g, "-")
              .trim(),
            description: registration.description,
            isActive: true,
            isFeatured: registration.type === "SHOPEE_MALL",
          },
        });
        updateData.brandId = brand.id;
      }
    }

    // Update registration
    const updatedRegistration = await prisma.brandRegistration.update({
      where: { id: params.id },
      data: updateData,
      include: {
        store: {
          include: {
            owner: true,
          },
        },
        brand: true,
      },
    });

    // TODO: Send notification email to seller
    // await sendBrandRegistrationEmail(registration.store.owner.email, action, rejectionReason);

    return NextResponse.json({
      registration: updatedRegistration,
      brand,
      message:
        action === "approve"
          ? "Đã duyệt đăng ký thương hiệu"
          : action === "reject"
            ? "Đã từ chối đăng ký thương hiệu"
            : "Đã yêu cầu nộp lại hồ sơ",
    });
  } catch (error) {
    console.error("Error reviewing brand registration:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Có lỗi xảy ra khi xử lý đăng ký" },
      { status: 500 }
    );
  }
}
