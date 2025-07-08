import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { BrandRegistrationStatus } from "@prisma/client";

// Validation schema
const brandRegistrationSchema = z.object({
  type: z.enum(["BRAND_OWNER", "DISTRIBUTOR", "SHOPEE_MALL"]),
  brandName: z.string().min(1, "Tên thương hiệu là bắt buộc"),
  description: z.string().optional(),
  companyName: z.string().min(1, "Tên công ty là bắt buộc"),
  companyAddress: z.string().optional(),
  taxCode: z.string().optional(),
  legalRepName: z.string().min(1, "Tên người đại diện pháp luật là bắt buộc"),
  legalRepPhone: z.string().min(1, "Số điện thoại người đại diện là bắt buộc"),
  legalRepEmail: z.string().email("Email không hợp lệ"),
  businessLicense: z.string().optional(),
  trademarkCertificate: z.string().optional(),
  distributionContract: z.string().optional(),
  authorizationLetter: z.string().optional(),
  supportingDocuments: z.array(z.string()).optional().default([]),
  qualityStandards: z.string().optional(),
  returnPolicy: z.string().optional(),
  authenticity: z.boolean().default(false),
});

// POST /api/seller/brand-registration - Submit brand registration
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has seller role or has a store
    const store = await prisma.store.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Bạn cần có cửa hàng để đăng ký thương hiệu" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = brandRegistrationSchema.parse(body);

    // Additional validation based on registration type
    if (
      validatedData.type === "BRAND_OWNER" &&
      !validatedData.trademarkCertificate
    ) {
      return NextResponse.json(
        {
          error:
            "Giấy chứng nhận đăng ký nhãn hiệu là bắt buộc cho đăng ký thương hiệu chính chủ",
        },
        { status: 400 }
      );
    }

    if (
      validatedData.type === "DISTRIBUTOR" &&
      !validatedData.distributionContract
    ) {
      return NextResponse.json(
        {
          error:
            "Hợp đồng phân phối là bắt buộc cho đăng ký phân phối thương hiệu",
        },
        { status: 400 }
      );
    }

    if (validatedData.type === "SHOPEE_MALL") {
      if (!validatedData.returnPolicy || !validatedData.authenticity) {
        return NextResponse.json(
          {
            error:
              "Shopee Mall yêu cầu chính sách đổi trả và cam kết hàng chính hãng",
          },
          { status: 400 }
        );
      }
    }

    // Check if store already has pending registration for the same brand
    const existingRegistration = await prisma.brandRegistration.findFirst({
      where: {
        storeId: store.id,
        brandName: validatedData.brandName,
        status: {
          in: ["PENDING", "UNDER_REVIEW", "RESUBMISSION"],
        },
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: "Đã có đăng ký cho thương hiệu này đang được xử lý" },
        { status: 400 }
      );
    }

    // Create brand registration
    const brandRegistration = await prisma.brandRegistration.create({
      data: {
        storeId: store.id,
        type: validatedData.type,
        brandName: validatedData.brandName,
        description: validatedData.description,
        companyName: validatedData.companyName,
        companyAddress: validatedData.companyAddress,
        taxCode: validatedData.taxCode,
        legalRepName: validatedData.legalRepName,
        legalRepPhone: validatedData.legalRepPhone,
        legalRepEmail: validatedData.legalRepEmail,
        businessLicense: validatedData.businessLicense,
        trademarkCertificate: validatedData.trademarkCertificate,
        distributionContract: validatedData.distributionContract,
        authorizationLetter: validatedData.authorizationLetter,
        supportingDocuments: JSON.stringify(validatedData.supportingDocuments),
        qualityStandards: validatedData.qualityStandards,
        returnPolicy: validatedData.returnPolicy,
        authenticity: validatedData.authenticity,
        submittedAt: new Date(),
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      registration: brandRegistration,
    });
  } catch (error) {
    console.error("Error creating brand registration:", error);

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

// GET /api/seller/brand-registration - Get brand registrations for current store
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's store with additional info for pre-filling
    const store = await prisma.store.findFirst({
      where: { ownerId: session.user.id },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        businessName: true,
        businessAddress: true,
        businessLicense: true,
        taxCode: true,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Bạn cần có cửa hàng để xem đăng ký thương hiệu" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Build where conditions
    const where: { storeId: string; status?: BrandRegistrationStatus } = {
      storeId: store.id,
    };
    if (status) {
      where.status = status as BrandRegistrationStatus;
    }

    const registrations = await prisma.brandRegistration.findMany({
      where,
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      registrations,
      storeInfo: store, // Include store info for pre-filling forms
    });
  } catch (error) {
    console.error("Error fetching brand registrations:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi tải danh sách đăng ký" },
      { status: 500 }
    );
  }
}
