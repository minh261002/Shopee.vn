'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Clock, ArrowRight, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/axios';
import Image from 'next/image';
import Link from 'next/link';
import type { FlashSale, FlashSaleItem } from '@/types/flash-sale';
import MaxWidthWrapper from '../layouts/MaxWidthWrapper';

interface FlashSaleSectionProps {
    className?: string;
}

export function FlashSaleSection({ className = '' }: FlashSaleSectionProps) {
    const [activeFlashSale, setActiveFlashSale] = useState<FlashSale | null>(null);
    const [timeRemaining, setTimeRemaining] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 6;

    useEffect(() => {
        fetchActiveFlashSale();
    }, []);

    useEffect(() => {
        if (!activeFlashSale) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const endTime = new Date(activeFlashSale.endTime).getTime();
            const distance = endTime - now;

            if (distance < 0) {
                setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
                clearInterval(timer);
                return;
            }

            const hours = Math.floor(distance / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeRemaining({ hours, minutes, seconds });
        }, 1000);

        return () => clearInterval(timer);
    }, [activeFlashSale]);

    const fetchActiveFlashSale = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/flash-sales/active');
            if (response.data.flashSale) {
                setActiveFlashSale(response.data.flashSale);
                // Track flash sale view
                trackFlashSaleView(response.data.flashSale.id);
            }
        } catch (error) {
            console.error('Error fetching active flash sale:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const trackFlashSaleView = async (flashSaleId: string) => {
        try {
            await api.post('/flash-sales/track-view', {
                flashSaleId,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                referrer: document.referrer,
            });
        } catch (error) {
            console.error('Error tracking flash sale view:', error);
        }
    };

    const trackProductView = async (flashSaleItemId: string, productId: string) => {
        try {
            await api.post('/flash-sales/track-product-view', {
                flashSaleItemId,
                productId,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                referrer: document.referrer,
            });
        } catch (error) {
            console.error('Error tracking product view:', error);
        }
    };

    if (isLoading) {
        return (
            <div className={`bg-white py-6 ${className}`}>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-gray-200 rounded-lg h-48 animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!activeFlashSale || !activeFlashSale.flashSaleItems || activeFlashSale.flashSaleItems.length === 0) {
        return null;
    }

    const formatTime = (num: number) => num.toString().padStart(2, '0');

    const getStatusText = (item: FlashSaleItem) => {
        const remaining = item.remainingQuantity;

        if (remaining <= 3) {
            return `CHỈ CÒN ${remaining}`;
        }

        // Hiển thị "ĐANG BÁN CHẠY" cho hầu hết sản phẩm (giống design)
        return 'ĐANG BÁN CHẠY';
    };

    const getStatusIcon = (item: FlashSaleItem) => {
        const remaining = item.remainingQuantity;

        if (remaining <= 3) {
            return <Flame className="w-3 h-3 text-white" />;
        }

        // Không có icon cho "ĐANG BÁN CHẠY" theo design
        return null;
    };

    return (
        <MaxWidthWrapper>
            <div className={`bg-white py-6 ${className}`}>
                <div className="px-2">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Zap className="w-6 h-6 text-red-500" />
                                <h2 className="text-2xl font-bold text-red-500">FLASH SALE</h2>
                            </div>
                            <div className="flex items-center gap-2 bg-black text-white px-3 py-1 rounded">
                                <Clock className="w-4 h-4" />
                                <span className="font-mono text-sm">
                                    {formatTime(timeRemaining.hours)} {formatTime(timeRemaining.minutes)} {formatTime(timeRemaining.seconds)}
                                </span>
                            </div>
                        </div>
                        <Link href="/flash-sale" className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors">
                            <span className="text-sm font-medium">Xem tất cả</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="relative">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {activeFlashSale.flashSaleItems
                                .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
                                .map((item) => (
                                    <div
                                        key={item.id}
                                        className="group cursor-pointer"
                                        onClick={() => trackProductView(item.id, item.productId)}
                                    >
                                        <div className="p-3">
                                            {/* Product Image */}
                                            <div className="relative mb-3">
                                                <div className="aspect-square bg-gray-100 overflow-hidden">
                                                    {item.product?.images?.[0] ? (
                                                        <Image
                                                            src={item.product.images[0].url}
                                                            alt={item.product.name}
                                                            width={200}
                                                            height={200}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                            <span className="text-gray-400 text-sm">No image</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {item.product?.store?.isVerified && item.product.store.type === 'OFFICIAL' && (
                                                    <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
                                                        Mall
                                                    </Badge>
                                                )}

                                                <div className="absolute top-2 right-2 flex items-center gap-1 bg-yellow-300 text-red-500 font-bold text-xs px-2 py-1 rounded ">
                                                    <span>-{item.discountPercent}%</span>
                                                </div>
                                            </div>

                                            {/* Product Info */}
                                            <div className="space-y-2">
                                                <h3 className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">
                                                    {item.product?.name || 'Product Name'}
                                                </h3>

                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold text-red-500">
                                                        <span className="underline">₫</span>{item.salePrice.toLocaleString()}
                                                    </span>
                                                    <span className="text-sm text-gray-500 line-through">
                                                        ₫{item.originalPrice.toLocaleString()}
                                                    </span>
                                                </div>

                                                {/* Status Bar */}
                                                <div className="mt-2">
                                                    <div className={`flex items-center justify-center text-xs px-2 py-1 rounded font-bold uppercase ${item.remainingQuantity <= 3
                                                        ? 'bg-red-500 text-white'
                                                        : 'bg-gradient-to-r from-orange-600 to-orange-400 text-white relative overflow-hidden'
                                                        }`}>
                                                        {item.remainingQuantity > 3 && (
                                                            <div className="absolute left-0 top-0 bottom-0 w-2 bg-orange-700 rounded-l"></div>
                                                        )}
                                                        {getStatusIcon(item)}
                                                        <span className={item.remainingQuantity <= 3 ? 'ml-1' : 'ml-3'}>
                                                            {getStatusText(item)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>

                        {(activeFlashSale?.flashSaleItems?.length || 0) > itemsPerPage && (
                            <div className="flex justify-end mt-4 absolute top-1/2 -right-4 -translate-y-1/2 z-10">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="w-8 h-8 rounded-full bg-white hover:bg-gray-50 shadow-md"
                                    onClick={() => {
                                        const totalPages = Math.ceil((activeFlashSale?.flashSaleItems?.length || 0) / itemsPerPage);
                                        if (currentPage < totalPages - 1) {
                                            setCurrentPage(currentPage + 1);
                                        } else {
                                            setCurrentPage(0); // Loop back to first page
                                        }
                                    }}
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MaxWidthWrapper>
    );
} 