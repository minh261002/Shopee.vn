"use client";
import Image from "next/image";
import Link from "next/link";
import { Bell, HelpCircle, ShoppingCart, StoreIcon, UserIcon } from "lucide-react";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { authClient } from "@/lib/auth-client";
import UserInfo from "./user-info";


const categories = [
    "Áo Kiểu Nữ", "Tia La De", "Dép", "Sale 1k Điện Thoại iPhone", "Ốp Đẹp",
    "Đồ Ngủ Hello Kitty Nữ"
];
const Header = () => {
    const { data: session } = authClient.useSession();

    console.log(session?.user?.name);

    return (
        <header className="w-full" style={{
            background: "linear-gradient(-180deg, #f53d2d, #f63)",
            transition: "transform .2s cubic-bezier(.4,0,.2,1)",
            transform: "translateY(0)"
        }}>
            <MaxWidthWrapper>

                <div className="flex justify-between items-center text-white text-sm py-2 pb-4">
                    <div className="flex gap-3 items-center">
                        <Link href="/seller-register" className="hover:underline flex items-center gap-2">
                            <StoreIcon className="w-4 h-4" />
                            Đăng ký cửa hàng trên Shopee
                        </Link>
                    </div>
                    <div className="flex gap-4 items-center">
                        <Link href="#" className="flex items-center gap-1 hover:underline">
                            <Bell size={16} /> Thông Báo
                        </Link>
                        <span>|</span>
                        <Link href="#" className="flex items-center gap-1 hover:underline">
                            <HelpCircle size={16} /> Hỗ Trợ
                        </Link>
                        <span>|</span>
                        {/* <Link href="/login" className="font-bold hover:underline flex items-center gap-1">
                            <UserIcon className="w-4 h-4" /> Đăng Nhập
                        </Link> */}
                        {session?.user ? <UserInfo name={session?.user?.name || ''} email={session?.user?.email || ''} image={session?.user?.image || ''} /> :
                            <Link href="/login" className="font-bold hover:underline flex items-center gap-1">
                                <UserIcon className="w-4 h-4" /> Đăng Nhập
                            </Link>}
                    </div>
                </div>
                <div className="flex items-center justify-between pb-4 gap-16">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/images/logo-white.png" alt="Shopee" width={150} height={150} style={{
                            filter: "invert(1)"
                        }} />
                    </Link>
                    <div className="flex-1">
                        <form className="flex w-full relative">
                            <input
                                type="text"
                                placeholder="Shopee bao ship 0Đ - Đăng ký ngay!"
                                className="w-full px-4 py-2 rounded-l-md outline-none text-gray-700 bg-white"
                            />
                            <button
                                type="submit"
                                className="h-8 bg-[#ee4d2d] hover:bg-[#d73c1a] text-white px-4 rounded-r-md font-bold transition absolute right-0 top-1/2 -translate-y-1/2 mr-2"
                            >
                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                                    <path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </form>
                        <div className="text-xs text-white mt-2 flex gap-2 overflow-x-auto w-full whitespace-nowrap scrollbar-hide">
                            {categories.map((cat) => (
                                <Link key={cat} href="#" className="hover:underline pr-2">{cat}</Link>
                            ))}
                        </div>
                    </div>
                    {/* Cart */}
                    <Link href="/cart" className="text-white relative">
                        <ShoppingCart size={32} />
                    </Link>
                </div>
            </MaxWidthWrapper>
        </header>
    );
}

export default Header;