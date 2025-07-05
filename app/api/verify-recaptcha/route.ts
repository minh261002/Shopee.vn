import { NextRequest, NextResponse } from "next/server";
import { verifyRecaptcha } from "@/lib/recaptcha";

export async function POST(req: NextRequest) {
  try {
    const { token, action } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "reCAPTCHA token is required" },
        { status: 400 }
      );
    }

    const result = await verifyRecaptcha(token);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "reCAPTCHA verification failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      score: result.score,
      action,
    });
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
