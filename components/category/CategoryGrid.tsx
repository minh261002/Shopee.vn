"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import MaxWidthWrapper from '../layouts/MaxWidthWrapper';
import { Skeleton } from "@/components/ui/skeleton";
import api from '@/lib/axios';

interface Category {
    id: string;
    name: string;
    slug: string;
    image: string;
    featured: boolean;
}

export function CategoryGrid() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await api.get('/categories?featured=true&limit=100');
                setCategories(res.data.categories || []);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setCategories([]);
            } finally {
                setIsLoading(false);
            }
        }

        fetchCategories();
    }, []);

    if (isLoading) {
        return (
            <MaxWidthWrapper>
                <div className="mb-8 bg-white">
                    <h2 className="text-xl font-semibold mb-4 text-foreground border p-4">DANH MỤC</h2>
                    <div className="grid grid-rows-2 grid-cols-10">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 border border-gray-100 p-4">
                                <Skeleton className="w-20 h-20 rounded-full" />
                                <Skeleton className="w-20 h-3" />
                            </div>
                        ))}
                    </div>
                </div>
            </MaxWidthWrapper>
        );
    }

    if (categories.length === 0) {
        return null;
    }

    const hasMoreCategories = categories.length > 20;
    const itemsPerPage = 20;
    const totalPages = hasMoreCategories ? Math.ceil(categories.length / itemsPerPage) : 1;
    const startIndex = hasMoreCategories ? currentPage * itemsPerPage : 0;
    const endIndex = hasMoreCategories ? startIndex + itemsPerPage : 20;
    const displayCategories = categories.slice(startIndex, endIndex);

    const handleNext = () => {
        setCurrentPage((prev) => (prev + 1) % totalPages);
    };

    return (
        <MaxWidthWrapper>
            <div className="mb-8 bg-[#fff]">
                <h2 className="text-xl font-semibold p-4 text-foreground border">DANH MỤC</h2>
                <div className="relative">
                    <div className="grid grid-rows-2 grid-cols-10">
                        {displayCategories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/category/${category.slug}`}
                                className="flex flex-col items-center justify-center gap-2 group transition-transform duration-200 border border-gray-100 p-4"
                            >
                                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden group-hover:shadow-lg transition-shadow">
                                    <Image
                                        src={category.image}
                                        alt={category.name}
                                        width={100}
                                        height={100}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = "/images/categories/default.png";
                                        }}
                                    />
                                </div>
                                <span className="text-xs text-center text-gray-700 group-hover:text-orange-500 transition-colors leading-tight max-w-[60px]">
                                    {category.name}
                                </span>
                            </Link>
                        ))}
                    </div>

                    {hasMoreCategories && (
                        <button
                            onClick={handleNext}
                            className="absolute -right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 group hover:scale-105 transition-transform duration-200 cursor-pointer"
                        >
                            <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center group-hover:bg-gray-300 transition-colors">
                                <ChevronRight className="w-6 h-6 text-gray-600" />
                            </div>
                        </button>
                    )}
                </div>
            </div>
        </MaxWidthWrapper>
    );
} 