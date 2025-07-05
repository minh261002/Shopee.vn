import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import MaxWidthWrapper from '@/components/layouts/MaxWidthWrapper'
import Footer from '@/components/layouts/footer'

const layout = (
    { children }: { children: React.ReactNode }
) => {
    return (
        <div>
            <div className='w-full'>
                <MaxWidthWrapper className='py-4'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                            <Link href="/">
                                <Image src="/images/logo-color.png" alt="Shopee" width={150} height={50} className='object-contain' />
                            </Link>
                            <span className='text-black text-3xl font-normal mt-3 hidden md:block'>Đăng nhập</span>
                        </div>

                        <Link href="/support" className='text-primary text-md'>
                            Bạn cần giúp đỡ ?
                        </Link>
                    </div>
                </MaxWidthWrapper>
            </div>
            <div className='w-full bg-primary'>
                <MaxWidthWrapper>
                    <div
                        className='h-[600px] w-full max-w-[1440px] flex items-center justify-center md:justify-end'
                        style={{
                            backgroundImage: "url('/images/bg-auth.png')",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                            backgroundBlendMode: "multiply",
                        }}>
                        <div className='flex items-center justify-center md:justify-end'>
                            {children}
                        </div>
                    </div>
                </MaxWidthWrapper>
                <Footer />
            </div>
        </div>
    )
}

export default layout