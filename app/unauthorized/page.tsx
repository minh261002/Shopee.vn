"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShieldX } from "lucide-react";

const Unauthorized = () => {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* Logo */}
                <div className="mb-8 flex justify-center">
                    <Image src="/images/logo-color.png" alt="Shopee" width={200} height={40} />
                </div>

                {/* Icon and Number */}
                <div className="mb-6 flex flex-col items-center">
                    <ShieldX className="w-24 h-24 text-red-500 mb-4" />
                    <h1 className="text-6xl font-black font-shopee-display text-red-500 leading-none">
                        403
                    </h1>
                </div>

                {/* Main Message */}
                <div className="mb-8 space-y-2">
                    <h2 className="text-2xl font-bold text-gray-800 font-shopee-display">
                        Truy cập bị từ chối!
                    </h2>
                    <p className="text-gray-600 font-shopee-display">
                        Bạn không có quyền truy cập nội dung này. Vui lòng đăng nhập với tài khoản có quyền phù hợp.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                    <Button
                        onClick={() => router.back()}
                        variant="default"
                        className="w-1/2 bg-[#EE4D2D] hover:bg-[#d73c1a] text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl font-shopee-display cursor-pointer"
                    >
                        Quay lại
                    </Button>
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

export default Unauthorized 