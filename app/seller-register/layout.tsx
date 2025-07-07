'use client'

import MaxWidthWrapper from '@/components/layouts/MaxWidthWrapper'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import Footer from '@/components/layouts/footer'

const SellerRegisterLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div>
            <div className='sticky top-0 z-50 bg-white shadow-md'>
                <div className='w-full'>
                    <MaxWidthWrapper className='py-4'>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-3'>
                                <Link href="/">
                                    <Image src="/images/logo-color.png" alt="Shopee" width={150} height={50} className='object-contain' />
                                </Link>
                                <span className='text-black text-3xl font-normal mt-3 hidden md:block'>Đăng ký cửa hàng</span>
                            </div>

                            <Link href="/support" className='text-primary text-md'>
                                Bạn cần giúp đỡ ?
                            </Link>
                        </div>
                    </MaxWidthWrapper>
                </div>
            </div>

            <div className='w-full bg-[#fefaf7]'>
                {children}
                <Footer />
            </div>
        </div>
    )
}

export default SellerRegisterLayout