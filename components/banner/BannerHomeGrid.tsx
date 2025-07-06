"use client";

import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Skeleton } from "@/components/ui/skeleton";
import MaxWidthWrapper from '../layouts/MaxWidthWrapper';

interface BannerHomeGridProps {
    banners: {
        id: string;
        items: { image: string; title?: string; linkUrl?: string }[];
    }[];
}

export function BannerHomeGrid({ banners }: BannerHomeGridProps) {
    const banner = banners[0];

    if (!banner || !banner.items || banner.items.length === 0) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 h-[240px]">
                <div className="md:col-span-2">
                    <Skeleton className="w-full h-full rounded-lg" />
                </div>
                <div className="flex flex-col gap-2">
                    <Skeleton className="w-full h-[118px] rounded-lg" />
                    <Skeleton className="w-full h-[118px] rounded-lg" />
                </div>
            </div>
        );
    }

    const sliderItems = banner.items;

    const rightItems = banner.items.length >= 3 ?
        banner.items.slice(-2) :
        banner.items.slice(0, 2);

    return (
        <>
            <style jsx global>{`
                .banner-swiper .swiper-button-next,
                .banner-swiper .swiper-button-prev {
                    width: 40px !important;
                    height: 40px !important;
                    background: rgba(0, 0, 0, 0.5) !important;
                    border-radius: 50% !important;
                    color: white !important;
                    border: 2px solid rgba(255, 255, 255, 0.3) !important;
                    transition: all 0.3s ease !important;
                    z-index: 10 !important;
                }
                
                .banner-swiper .swiper-button-next:hover,
                .banner-swiper .swiper-button-prev:hover {
                    background: rgba(0, 0, 0, 0.8) !important;
                    border-color: rgba(255, 255, 255, 0.6) !important;
                    transform: scale(1.1) !important;
                }
                
                .banner-swiper .swiper-button-next::after,
                .banner-swiper .swiper-button-prev::after {
                    font-size: 16px !important;
                    font-weight: bold !important;
                }
                
                .banner-swiper .swiper-button-next {
                    right: 10px !important;
                }
                
                .banner-swiper .swiper-button-prev {
                    left: 10px !important;
                }
                
                .banner-swiper .swiper-button-disabled {
                    opacity: 0.3 !important;
                    cursor: not-allowed !important;
                }
                
                /* Custom pagination */
                .banner-swiper .swiper-pagination {
                    bottom: 10px !important;
                }
                
                .banner-swiper .swiper-pagination-bullet {
                    width: 8px !important;
                    height: 8px !important;
                    background: rgba(255, 255, 255, 0.5) !important;
                    border: 1px solid rgba(255, 255, 255, 0.8) !important;
                    opacity: 1 !important;
                    transition: all 0.3s ease !important;
                }
                
                .banner-swiper .swiper-pagination-bullet-active {
                    background: white !important;
                    transform: scale(1.2) !important;
                }
            `}</style>
            <MaxWidthWrapper>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 h-[240px]">
                    <div className="md:col-span-2 h-full">
                        <div className="h-full w-full">
                            <Swiper
                                modules={[Autoplay, Navigation, Pagination]}
                                slidesPerView={1}
                                loop={sliderItems.length > 1}
                                navigation={sliderItems.length > 1}
                                pagination={{ clickable: true }}
                                autoplay={sliderItems.length > 1 ? { delay: 4000, disableOnInteraction: false } : false}
                                observer={true}
                                observeParents={true}
                                watchSlidesProgress={true}
                                className="!h-full !w-full rounded-lg banner-swiper"
                                style={{ height: '240px' }}
                            >
                                {sliderItems.map((item, index) => (
                                    <SwiperSlide key={index} className="!h-full">
                                        <a href={item.linkUrl || '#'} target="_blank" rel="noopener noreferrer" className="block h-full">
                                            <Image
                                                src={item.image}
                                                alt={item.title || 'Banner'}
                                                width={1200}
                                                height={240}
                                                className="w-full h-full object-cover rounded-lg"
                                                priority={index === 0}
                                            />
                                        </a>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 h-full">
                        {rightItems.map((item, index) => (
                            <div key={index} className="flex-1">
                                <a
                                    href={item.linkUrl || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block h-full"
                                >
                                    <Image
                                        src={item.image}
                                        alt={item.title || 'Banner'}
                                        width={400}
                                        height={118}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </MaxWidthWrapper>
        </>
    );
} 