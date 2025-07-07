import { FacebookIcon, InstagramIcon, LinkedinIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";

const footerLinks = [
    {
        title: "DỊCH VỤ KHÁCH HÀNG",
        items: [
            "Trung Tâm Trợ Giúp Shopee",
            "Shopee Blog",
            "Shopee Mall",
            "Hướng Dẫn Mua Hàng/Đặt Hàng",
            "Hướng Dẫn Bán Hàng",
            "Ví ShopeePay",
            "Shopee Xu",
            "Đơn Hàng",
            "Trả Hàng/Hoàn Tiền",
            "Liên Hệ Shopee",
            "Chính Sách Bảo Hành",
        ],
    },
    {
        title: "SHOPEE VIỆT NAM",
        items: [
            "Về Shopee",
            "Tuyển Dụng",
            "Điều Khoản Shopee",
            "Chính Sách Bảo Mật",
            "Shopee Mall",
            "Kênh Người Bán",
            "Flash Sale",
            "Tiếp Thị Liên Kết",
            "Liên Hệ Truyền Thông",
        ],
    },
];

const paymentIcons = [
    "/images/payment/visa.png",
    "/images/payment/mastercard.png",
    "/images/payment/jcb.png",
    "/images/payment/amex.png",
    "/images/payment/cod.png",
    "/images/payment/shopeepay.png",
    "/images/payment/spaylater.png",
    "/images/payment/gop.png",
];

const shippingIcons = [
    "/images/shipping/spx.png",
    "/images/shipping/viettel.png",
    "/images/shipping/jt.png",
    "/images/shipping/vnpost.png",
    "/images/shipping/grab.png",
    "/images/shipping/ninjavan.png",
    "/images/shipping/be.png",
    "/images/shipping/ahamove.png",
    "/images/shipping/ghn.png",
];

const socialLinks = [
    { icon: <FacebookIcon />, label: "Facebook", href: "#", className: "bg-[#1877F2]" },
    { icon: <InstagramIcon />, label: "Instagram", href: "#", className: "bg-[#C13584]" },
    { icon: <LinkedinIcon />, label: "LinkedIn", href: "#", className: "bg-[#0077B5]" },
];

const appLinks = [
    { icon: "/images/appstore.png", label: "App Store", href: "#" },
    { icon: "/images/googleplay.png", label: "Google Play", href: "#" },
    { icon: "/images/appgallery.png", label: "App Gallery", href: "#" },
];

export default function Footer(
    { className }: { className?: string }
) {
    return (
        <footer className={`bg-[#f5f5f5] border-t text-sm text-gray-700 ${className}`}>
            <MaxWidthWrapper>
                <div className=" px-4 py-10 grid grid-cols-1 md:grid-cols-5 gap-8">
                    {/* Cột 1 & 2: Dịch vụ khách hàng & Shopee VN */}
                    {footerLinks.map((col) => (
                        <div key={col.title}>
                            <h3 className="font-bold mb-3">{col.title}</h3>
                            <ul className="space-y-1">
                                {col.items.map((item) => (
                                    <li key={item}>
                                        <Link href="#" className="hover:underline">{item}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Cột 3: Thanh toán & Vận chuyển */}
                    <div>
                        <h3 className="font-bold mb-3">THANH TOÁN</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {paymentIcons.map((src, i) => (
                                <div key={i} className="bg-white rounded-md p-2">
                                    <Image src={src} alt="payment" width={400} height={400} className="object-contain w-10" />
                                </div>
                            ))}
                        </div>
                        <h3 className="font-bold mb-3">ĐƠN VỊ VẬN CHUYỂN</h3>
                        <div className="flex flex-wrap gap-2">
                            {shippingIcons.map((src, i) => (
                                <div key={i} className="bg-white rounded-md p-2">
                                    <Image src={src} alt="shipping" width={40} height={40} className="object-contain w-10" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cột 4: Theo dõi Shopee */}
                    <div>
                        <h3 className="font-bold mb-3">THEO DÕI SHOPEE</h3>
                        <ul className="space-y-2">
                            {socialLinks.map((s) => (
                                <li key={s.label} className="flex items-center gap-2">
                                    <div className={`rounded-md p-1 ${s.className} text-white`}>
                                        {s.icon}
                                    </div>
                                    <Link href={s.href} className="hover:underline text-sm">{s.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Cột 5: Tải ứng dụng */}
                    <div>
                        <h3 className="font-bold mb-3">TẢI ỨNG DỤNG SHOPEE</h3>
                        <div className="flex gap-2 mb-2">
                            <Image src="/images/code.png" alt="QR" width={400} height={400} className="object-contain w-28" />
                            <div className="flex flex-col gap-2">
                                {appLinks.map((a) => (
                                    <div key={a.label} className="bg-white rounded-md p-2">
                                        <Link href={a.href} className="flex items-center justify-center">
                                            <Image src={a.icon} alt={a.label} width={400} height={400} className="object-contain w-16" />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t py-6 text-center text-md text-gray-500 flex flex-col gap-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                        <p> © 2025 Shopee. Tất cả các quyền được bảo lưu.</p>
                        <p>Quốc gia & Khu vực: Singapore | Indonesia | Thái Lan | Malaysia | Việt Nam | Philippines | Brazil | México | Colombia | Chile | Đài Loan</p>
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                        <Link href="#" className="hover:underline">Chính sách bảo mật</Link>
                        <span className="hidden md:block">|</span>
                        <Link href="#" className="hover:underline">Quy chế hoạt động</Link>
                        <span className="hidden md:block">|</span>
                        <Link href="#" className="hover:underline">Chính sách vận chuyển</Link>
                        <span className="hidden md:block">|</span>
                        <Link href="#" className="hover:underline">Chính sách trả hàng và hoàn tiền</Link>
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        <div style={{
                            backgroundImage: "url('/images/footer.png')",
                            backgroundPosition: "14.3911439114% 99.4117647059%",
                            backgroundSize: "551.6666666667% 477.7777777778%",
                            height: "2.8125rem",
                            width: "7.5rem",
                        }} />

                        <div style={{
                            backgroundImage: "url('/images/footer.png')",
                            backgroundPosition: "14.3911439114% 99.4117647059%",
                            backgroundSize: "551.6666666667% 477.7777777778%",
                            height: "2.8125rem",
                            width: "7.5rem",
                        }} />

                        <div style={{
                            backgroundImage: "url('/images/footer.png')",
                            backgroundPosition: "1.6286644951% 92.2155688623%",
                            backgroundSize: "1379.1666666667% 447.9166666667%",
                            height: "3rem",
                            width: "3rem",
                        }} />
                    </div>

                    <div className="text-md text-gray-500 text-center space-y-1 font-shopee-display">
                        <div className="font-semibold text-lg mb-10">Công ty TNHH Shopee</div>
                        <div>
                            <span className="font-medium">Địa chỉ:</span> Tầng 4-5-6, Tòa nhà Capital Place, số 29 đường Liễu Giai, Phường Ngọc Khánh, Quận Ba Đình, Thành phố Hà Nội, Việt Nam.
                        </div>
                        <div>
                            <span className="font-medium">Chăm sóc khách hàng:</span> Gọi tổng đài Shopee (miễn phí) hoặc Trò chuyện với Shopee ngay trên Trung tâm trợ giúp
                        </div>
                        <div>
                            <span className="font-medium">Chịu Trách Nhiệm Quản Lý Nội Dung:</span> Nguyễn Bùi Anh Tuấn
                        </div>
                        <div>
                            <span className="font-medium">Mã số doanh nghiệp:</span> 0106773786 do Sở Kế hoạch và Đầu tư TP Hà Nội cấp lần đầu ngày 10/02/2015
                        </div>
                        <div className="mt-2">&copy; 2015 - Bản quyền thuộc về Công ty TNHH Shopee</div>
                    </div>
                </div>
            </MaxWidthWrapper>
        </footer>
    );
}