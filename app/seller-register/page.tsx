'use client'

import { motion } from 'framer-motion'
import { GiftIcon, HandHelpingIcon, StoreIcon, GraduationCap, Youtube, ShoppingBag, Facebook } from 'lucide-react'
import MaxWidthWrapper from '@/components/layouts/MaxWidthWrapper'
import Link from 'next/link'

const RegisterPage = () => {
    return (
        <div>
            {/* Hero Section */}
            <div className='w-full bg-[#fefaf7]'>
                <MaxWidthWrapper>
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className='h-[600px] w-full max-w-[1440px] flex items-center justify-center'
                        style={{
                            backgroundImage: "url('/images/seller-bg.png')",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                            backgroundBlendMode: "multiply",
                        }}>
                        <div className='flex flex-col items-start justify-center w-full max-w-xl'>
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className='text-[#ee4d2d] text-2xl md:text-3xl font-bold mb-2 text-center'
                            >
                                Shopee Việt Nam
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className='text-[#ee4d2d] text-4xl md:text-5xl font-bold mb-4 text-left'
                            >
                                Trở thành Người bán ngay hôm nay
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                                className='text-[#ee4d2d] text-md font-medium mb-2 text-center flex items-center gap-2'
                            >
                                <StoreIcon className='w-4 h-4' />
                                Nền tảng thương mại điện tử hàng đầu Đông Nam Á và Đài Loan
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.7 }}
                                className='text-[#ee4d2d] text-md md:text-md font-medium mb-2 text-center flex items-center gap-2'
                            >
                                <GiftIcon className='w-4 h-4' />
                                Phát triển trở thành thương hiệu toàn cầu
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.9 }}
                                className='text-[#ee4d2d] text-md md:text-md font-medium text-center flex items-center gap-2'
                            >
                                <HandHelpingIcon className='w-4 h-4' />
                                Dẫn đầu lượng người dùng trên ứng dụng mua sắm tại Việt Nam
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 1.1 }}
                                className='mt-8 w-full flex justify-center'
                            >
                                <Link href="/seller-register/setup">
                                    <button className="bg-[#ee4d2d] hover:bg-[#d73c1a] text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg transition-all duration-200">
                                        Bắt đầu đăng ký ngay
                                    </button>
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                </MaxWidthWrapper>
            </div>

            {/* Section: Tại sao nên bán hàng trên Shopee */}
            <div className="w-full py-16 bg-white">
                <MaxWidthWrapper>
                    <motion.h2
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center text-2xl md:text-3xl font-semibold text-gray-600 mb-12"
                    >
                        TẠI SAO NÊN BÁN HÀNG TRÊN SHOPEE
                    </motion.h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
                        {/* 1 */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="flex flex-col items-center text-center"
                        >
                            <div
                                style={{
                                    backgroundImage: "url('/images/seller-icon.png')",
                                    backgroundPosition: "97.91666666666667% 23.731587561374795%",
                                    backgroundSize: "3319.512195121951% 948.6111111111111%",
                                    width: "83px",
                                    height: "72px",
                                }}
                                className='mb-2 bg-cover bg-center rounded-full'
                            />
                            <div className="text-lg font-semibold mb-1">Miễn phí đăng ký</div>
                            <div className="text-gray-500">Mở Shop và bán hàng dễ dàng hơn cùng Shopee!</div>
                        </motion.div>
                        {/* 2 */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="flex flex-col items-center text-center"
                        >
                            <div
                                style={{
                                    backgroundImage: "url('/images/seller-icon.png')",
                                    backgroundPosition: "37.04545454545455% 46.808510638297875%",
                                    backgroundSize: "3319.512195121951% 948.6111111111111%",
                                    width: "83px",
                                    height: "72px",
                                }}
                                className='mb-2 bg-cover bg-center rounded-full'
                            />
                            <div className="text-lg font-semibold mb-1">Công cụ marketing đa dạng</div>
                            <div className="text-gray-500">Thu hút người mua và tăng trưởng đơn hàng với tính năng Flash Sale, Livestream, Mua Kèm Deal Sốc,...</div>
                        </motion.div>
                        {/* 3 */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col items-center text-center"
                        >
                            <div
                                style={{
                                    backgroundImage: "url('/images/seller-icon.png')",
                                    backgroundPosition: "36.666666666666664% 16.693944353518823%",
                                    backgroundSize: "3319.512195121951% 948.6111111111111%",
                                    width: "83px",
                                    height: "72px",
                                }}
                                className='mb-2 bg-cover bg-center rounded-full'
                            />                                <div className="text-lg font-semibold mb-1">Vận chuyển dễ dàng</div>
                            <div className="text-gray-500">Linh hoạt lựa chọn đơn vị vận chuyển và theo dõi chi tiết hành trình đơn hàng.</div>
                        </motion.div>
                        {/* 4 */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex flex-col items-center text-center"
                        >
                            <div
                                style={{
                                    backgroundImage: "url('/images/seller-icon.png')",
                                    backgroundPosition: "38.333333333333336% 31.751227495908346%",
                                    backgroundSize: "3319.512195121951% 948.6111111111111%",
                                    width: "83px",
                                    height: "72px",
                                }}
                                className='mb-2 bg-cover bg-center rounded-full'
                            />
                            <div className="text-lg font-semibold mb-1">Siêu sale cùng Shopee</div>
                            <div className="text-gray-500">Bứt phá doanh số với các chiến dịch lớn: 9.9 Ngày Siêu Mua Sắm, 11.11 Siêu Sale,...</div>
                        </motion.div>
                        {/* 5 */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="flex flex-col items-center text-center"
                        >
                            <div
                                style={{
                                    backgroundImage: "url('/images/seller-icon.png')",
                                    backgroundPosition: "32.5% 1.6366612111292962%",
                                    backgroundSize: "3319.512195121951% 948.6111111111111%",
                                    width: "83px",
                                    height: "72px",
                                }}
                                className='mb-2 bg-cover bg-center rounded-full'
                            />                                <div className="text-lg font-semibold mb-1">Hỗ trợ bán hàng hiệu quả</div>
                            <div className="text-gray-500">Đa dạng tính năng giúp quản lý, tương tác với khách hàng và theo dõi hiệu quả hoạt động của Shop.</div>
                        </motion.div>
                        {/* 6 */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className="flex flex-col items-center text-center"
                        >
                            <div
                                style={{
                                    backgroundImage: "url('/images/seller-icon.png')",
                                    backgroundPosition: "45.22727272727273% 50.90016366612111%",
                                    backgroundSize: "3319.512195121951% 948.6111111111111%",
                                    width: "83px",
                                    height: "72px",
                                }}
                                className='mb-2 bg-cover bg-center rounded-full'
                            />                                <div className="text-lg font-semibold mb-1">Kết nối cộng đồng Người bán</div>
                            <div className="text-gray-500">Chia sẻ kinh nghiệm bán hàng thực tế thông qua các hội thảo, khoá học trực tuyến và cộng đồng hỗ trợ.</div>
                        </motion.div>
                    </div>
                </MaxWidthWrapper>
            </div>
            {/* Section: Theo dõi cộng đồng nhà bán hàng Shopee */}
            <div className="w-full py-16 bg-white">
                <MaxWidthWrapper>
                    <motion.h2
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center text-2xl md:text-3xl font-semibold text-gray-500 mb-12"
                    >
                        THEO DÕI CỘNG ĐỒNG NHÀ BÁN HÀNG SHOPEE
                    </motion.h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 max-w-6xl mx-auto">
                        {/* 1 */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="flex flex-col items-center text-center"
                        >
                            <span className="mb-4 flex items-center justify-center w-14 h-14 rounded-full border-2 border-[#ee4d2d]">
                                <GraduationCap className="w-8 h-8 text-[#ee4d2d]" strokeWidth={1.5} />
                            </span>
                            <div className="text-lg font-semibold mb-1">Học viện Shopee - Shopee Uni</div>
                            <div className="text-gray-500">Học viện Shopee Uni cung cấp các kiến thức và chương trình đào tạo hữu ích dành cho Người bán</div>
                        </motion.div>
                        {/* 2 */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="flex flex-col items-center text-center"
                        >
                            <span className="mb-4 flex items-center justify-center w-14 h-14 rounded-full border-2 border-[#ee4d2d]">
                                <Youtube className="w-8 h-8 text-[#ee4d2d]" strokeWidth={1.5} />
                            </span>
                            <div className="text-lg font-semibold mb-1">Kênh Youtube Shopee Uni Việt Nam</div>
                            <div className="text-gray-500">Kênh tương tác Học viện Shopee Uni luôn cập nhật nhanh chóng những chính sách, tính năng mới, lịch học online và các sự kiện nổi bật từ Shopee.</div>
                        </motion.div>
                        {/* 3 */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col items-center text-center"
                        >
                            <span className="mb-4 flex items-center justify-center w-14 h-14 rounded-full border-2 border-[#ee4d2d]">
                                <ShoppingBag className="w-8 h-8 text-[#ee4d2d]" strokeWidth={1.5} />
                            </span>
                            <div className="text-lg font-semibold mb-1">Fanpage Bán Hàng Với Shopee</div>
                            <div className="text-gray-500">Kênh thông tin chính thức dành cho Người bán trên Shopee</div>
                        </motion.div>
                        {/* 4 */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex flex-col items-center text-center"
                        >
                            <span className="mb-4 flex items-center justify-center w-14 h-14 rounded-full border-2 border-[#ee4d2d]">
                                <Facebook className="w-8 h-8 text-[#ee4d2d]" strokeWidth={1.5} />
                            </span>
                            <div className="text-lg font-semibold mb-1">Nhóm Lập Nghiệp Với Shopee</div>
                            <div className="text-gray-500">Cộng đồng kết nối Người bán và chia sẻ bí kíp bán hàng thực tế từ những Người bán có kinh nghiệm.</div>
                        </motion.div>
                    </div>
                </MaxWidthWrapper>
            </div>
            <div
                className="w-full py-16"
                style={{
                    backgroundImage: "url('/images/seller-bg-2.png'), linear-gradient(180deg, #f53d2d 0%, #f63 100%)",
                    backgroundBlendMode: "multiply",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <MaxWidthWrapper>
                    <motion.h2
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center text-2xl md:text-3xl font-bold text-white mb-12 tracking-wide"
                    >
                        CÁC BƯỚC MỞ CỬA HÀNG TRÊN SHOPEE
                    </motion.h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 max-w-6xl mx-auto">
                        {/* Bước 1 */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="flex flex-col items-center text-center"
                        >
                            <div className="text-white text-6xl font-light mb-2">01</div>
                            <div className="text-white text-lg font-bold mb-1">Đăng ký tài khoản Shopee</div>
                            <div className="text-white/90 text-base">Tại trang Shopee, nhấn Đăng Ký để tạo tài khoản. Sau đó, nhập Số điện thoại và Email tại trang Tài Khoản Của Tôi để xác minh tài khoản.</div>
                        </motion.div>
                        {/* Bước 2 */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="flex flex-col items-center text-center"
                        >
                            <div className="text-white text-6xl font-light mb-2">02</div>
                            <div className="text-white text-lg font-bold mb-1">Cài đặt thông tin cửa hàng</div>
                            <div className="text-white/90 text-base">Đi đến Kênh Người Bán, đặt tên Shop và thiết lập địa chỉ lấy hàng của bạn.</div>
                        </motion.div>
                        {/* Bước 3 */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col items-center text-center"
                        >
                            <div className="text-white text-6xl font-light mb-2">03</div>
                            <div className="text-white text-lg font-bold mb-1">Cài đặt vận chuyển</div>
                            <div className="text-white/90 text-base">Thiết lập phương thức vận chuyển cho Shop và nhấn Hoàn tất.</div>
                        </motion.div>
                        {/* Bước 4 */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex flex-col items-center text-center"
                        >
                            <div className="text-white text-6xl font-light mb-2">04</div>
                            <div className="text-white text-lg font-bold mb-1">Đăng bán sản phẩm</div>
                            <div className="text-white/90 text-base">Chọn Thêm Sản Phẩm, sau đó điền chi tiết thông tin và nhấn Lưu & Hiển thị để hoàn tất.</div>
                        </motion.div>
                    </div>
                </MaxWidthWrapper>
            </div>

        </div>
    )
}

export default RegisterPage