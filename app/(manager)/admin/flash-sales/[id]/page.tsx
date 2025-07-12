"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Plus, Calendar, Target, Zap, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/axios';
import type { FlashSale } from '@/types/flash-sale';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Image from 'next/image';

const FlashSaleDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const [flashSale, setFlashSale] = useState<FlashSale | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const id = params.id as string;

    useEffect(() => {
        const fetchFlashSale = async () => {
            try {
                setIsLoading(true);
                const response = await api.get(`/admin/flash-sales/${id}`);
                setFlashSale(response.data);
            } catch (error) {
                console.error('Error fetching flash sale:', error);
                toast.error('Lỗi khi tải thông tin chương trình khuyến mãi');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchFlashSale();
        }
    }, [id]);

    const getStatusBadge = (flashSale: FlashSale) => {
        const now = new Date();
        const startTime = new Date(flashSale.startTime);
        const endTime = new Date(flashSale.endTime);

        if (flashSale.status === 'CANCELLED') {
            return <Badge variant="destructive">Đã hủy</Badge>;
        }

        if (now < startTime) {
            return <Badge variant="secondary">Sắp diễn ra</Badge>;
        }

        if (now >= startTime && now <= endTime) {
            return <Badge variant="default">Đang diễn ra</Badge>;
        }

        return <Badge variant="destructive">Đã kết thúc</Badge>;
    };

    const getProgressPercentage = (flashSale: FlashSale) => {
        const now = new Date();
        const startTime = new Date(flashSale.startTime);
        const endTime = new Date(flashSale.endTime);
        const totalDuration = endTime.getTime() - startTime.getTime();
        const elapsed = now.getTime() - startTime.getTime();

        if (now < startTime) return 0;
        if (now > endTime) return 100;

        return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    };

    const getTimeRemaining = (flashSale: FlashSale) => {
        const now = new Date();
        const startTime = new Date(flashSale.startTime);
        const endTime = new Date(flashSale.endTime);

        if (now < startTime) {
            const diff = startTime.getTime() - now.getTime();
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            return `${days} ngày ${hours} giờ ${minutes} phút`;
        }

        if (now > endTime) {
            return 'Đã kết thúc';
        }

        const diff = endTime.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${days} ngày ${hours} giờ ${minutes} phút`;
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-64"></div>
                        <div className="h-4 bg-gray-200 rounded w-96 mt-2"></div>
                    </div>
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <div className="animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-32"></div>
                                <div className="h-4 bg-gray-200 rounded w-48 mt-2"></div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                                    <div className="h-10 bg-gray-200 rounded mt-2"></div>
                                </div>
                                <div className="animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                                    <div className="h-20 bg-gray-200 rounded mt-2"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (!flashSale) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Chương trình khuyến mãi không tồn tại</h1>
                    </div>
                </div>
            </div>
        );
    }

    const progress = getProgressPercentage(flashSale);
    const timeRemaining = getTimeRemaining(flashSale);
    const items = flashSale.flashSaleItems || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{flashSale.name}</h1>
                        <p className="text-muted-foreground">
                            Chi tiết chương trình khuyến mãi
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => router.push(`/admin/flash-sales/${id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                    </Button>
                    <Button onClick={() => router.push(`/admin/flash-sales/${id}/items`)}>
                        <Package className="mr-2 h-4 w-4" />
                        Quản lý sản phẩm
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                Thông tin cơ bản
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Trạng thái:</span>
                                {getStatusBadge(flashSale)}
                            </div>

                            {flashSale.description && (
                                <div>
                                    <span className="text-sm font-medium">Mô tả:</span>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {flashSale.description}
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm font-medium">Thời gian bắt đầu:</span>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {format(new Date(flashSale.startTime), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium">Thời gian kết thúc:</span>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {format(new Date(flashSale.endTime), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm font-medium">Giới hạn mỗi user:</span>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {flashSale.maxQuantityPerUser || 'Không giới hạn'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium">Đơn hàng tối thiểu:</span>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {flashSale.minOrderAmount ? `${flashSale.minOrderAmount.toLocaleString()}đ` : 'Không yêu cầu'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Tiến độ
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Tiến độ</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </div>

                            <div className="text-center">
                                <span className="text-sm font-medium">Thời gian còn lại:</span>
                                <p className="text-lg font-bold text-primary mt-1">{timeRemaining}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {flashSale.bannerImage && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Banner</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Image
                                    src={flashSale.bannerImage}
                                    alt="Flash sale banner"
                                    width={1000}
                                    height={1000}
                                    className="w-full h-48 object-cover rounded-lg"
                                />
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Sản phẩm
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center">
                                <div className="text-3xl font-bold">{items.length}</div>
                                <p className="text-sm text-muted-foreground">sản phẩm</p>
                            </div>
                            <Button
                                className="w-full mt-4"
                                onClick={() => router.push(`/admin/flash-sales/${id}/items`)}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Thêm sản phẩm
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Thống kê
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-sm">Tổng sản phẩm:</span>
                                <span className="font-medium">{items.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm">Đã bán:</span>
                                <span className="font-medium">
                                    {items.reduce((sum, item) => sum + item.soldQuantity, 0)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm">Còn lại:</span>
                                <span className="font-medium">
                                    {items.reduce((sum, item) => sum + item.remainingQuantity, 0)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default FlashSaleDetailPage; 