"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";

const NotFound = () => {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* Logo */}
                <div className="mb-8 flex justify-center">
                    <Image src="/images/logo-color.png" alt="Shopee" width={200} height={40} />
                </div>

                {/* 404 Number with Shopee Orange */}
                <div className="mb-6">
                    <h1 className="text-8xl font-black font-shopee-display text-[#EE4D2D] leading-none">
                        404
                    </h1>
                </div>

                {/* Main Message */}
                <div className="mb-8 space-y-2">
                    <p className="text-gray-600 font-shopee-display">
                        Rất tiếc! Trang bạn đang tìm kiếm không tồn tại.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                    <Link href="/">
                        <Button
                            onClick={() => router.back()}
                            className="w-1/2 bg-[#EE4D2D] hover:bg-[#d73c1a] text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl font-shopee-display cursor-pointer"
                        >
                            Quay lại
                        </Button>
                    </Link>

                </div>

                {/* Help Text */}
                <div className="mt-8 text-sm text-gray-500 font-shopee-display">
                    <p>
                        Nếu bạn cho rằng đây là lỗi, vui lòng{" "}
                        <Link href="/contact" className="text-[#EE4D2D] hover:underline">
                            liên hệ với chúng tôi
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default NotFound