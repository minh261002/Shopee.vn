'use client';

import { useEffect, useState } from 'react';
import { BannerHomeGrid } from '@/components/banner/BannerHomeGrid';
import Header from '@/components/layouts/header';
import api from '@/lib/axios';
import { Skeleton } from '@/components/ui/skeleton';

// Device detection utility
function getDeviceType() {
  if (typeof window === 'undefined') return 'desktop';

  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export default function HomePage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [device, setDevice] = useState('desktop');

  useEffect(() => {
    // Detect device on client side
    setDevice(getDeviceType());

    // Listen for window resize
    const handleResize = () => {
      setDevice(getDeviceType());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    async function fetchBanners() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          position: 'HOMEPAGE_HERO',
          status: 'PUBLISHED',
          isActive: 'true',
          device: device,
          limit: '10'
        });

        const res = await api.get(`/banners?${params.toString()}`);
        setBanners(res.data.banners || []);
      } catch {
        setBanners([]);
      } finally {
        setLoading(false);
      }
    }

    fetchBanners();
  }, [device]); // Refetch when device changes

  return (
    <main>
      <Header />
      <div className="max-w-7xl mx-auto py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 h-[240px]">
            <div className="md:col-span-2">
              <Skeleton className="w-full h-full rounded-lg" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="w-full h-[118px] rounded-lg" />
              <Skeleton className="w-full h-[118px] rounded-lg" />
            </div>
          </div>
        ) : (
          <BannerHomeGrid banners={banners} />
        )}
      </div>
    </main>
  );
}