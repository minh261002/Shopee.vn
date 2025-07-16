'use client';

import { BannerHomeGrid } from '@/components/banner/BannerHomeGrid';
import { CategoryGrid } from '@/components/category/CategoryGrid';
import Footer from '@/components/layouts/footer';
import Header from '@/components/layouts/header';

export default function HomePage() {
  return (
    <main className='bg-[#f5f5f5]'>
      <Header />

      <div className='w-full bg-white py-10 mb-10'>
        <BannerHomeGrid />
      </div>

      <div className='mb-10'>
        <CategoryGrid />
      </div>

      <Footer />
    </main>
  );
}