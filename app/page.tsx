'use client';

import { BannerHomeGrid } from '@/components/banner/BannerHomeGrid';
import Header from '@/components/layouts/header';


export default function HomePage() {

  return (
    <main>
      <Header />
      <div className="max-w-7xl mx-auto py-6">
        <BannerHomeGrid />
      </div>
    </main>
  );
}