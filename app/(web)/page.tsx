'use client';

import { BannerHomeGrid } from '@/components/homePage/BannerHomeGrid';
import { CategoryGrid } from '@/components/homePage/CategoryGrid';
import { FlashSaleSection } from '@/components/homePage/FlashSaleSection';
import Footer from '@/components/layouts/footer';
import Header from '@/components/layouts/header';
import MaxWidthWrapper from '@/components/layouts/MaxWidthWrapper';
import Image from 'next/image';

export default function HomePage() {
  const data = [
    {
      image: '/images/vnd.png',
      title: 'Mã giảm giá'
    },
    {
      image: '/images/choice.png',
      title: 'Hàng chọn giá hời'
    },
    {
      image: '/images/sale.png',
      title: 'Deal hot giờ vàng'
    },
    {
      image: '/images/style.png',
      title: 'Shoppe Style voucher 30%'
    },
    {
      image: '/images/xu.png',
      title: 'Săn ngay 100.000 xu'
    },
    {
      image: '/images/reward.png',
      title: 'Khách hàng thân thiết'
    },
  ]
  return (
    <main className='bg-[#f5f5f5]'>
      <Header />

      <div className='w-full bg-white py-10 mb-10 space-y-8'>
        <BannerHomeGrid />

        <MaxWidthWrapper>
          <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 items-start'>
            {data.map((item, index) => (
              <div key={index} className='flex flex-col items-center justify-center'>
                <Image src={item.image} alt={item.title} width={50} height={50} />
                <p className='text-sm text-center max-w-[100px]'>{item.title}</p>
              </div>
            ))}
          </div>
        </MaxWidthWrapper>
      </div>

      <div className='mb-10'>
        <CategoryGrid />
      </div>

      <FlashSaleSection />

      <Footer />
    </main>
  );
}