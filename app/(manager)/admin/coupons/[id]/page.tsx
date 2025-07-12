"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Calendar, Target, Users, Ticket, DollarSign, Percent, Truck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { api } from '@/lib/axios';
import type { Coupon } from '@/types/coupon';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const CouponDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const [coupon, setCoupon] = useState<Coupon | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCoupon = async () => {
            try {
                setIsLoading(true);
                const response = await api.get(`/admin/coupons/${params.id}`);
                setCoupon(response.data);
            } catch (error) {
                console.error('Error fetching coupon:', error);
                toast.error('Lỗi khi tải thông tin coupon');
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchCoupon();
        }
    }, [params.id]);

    const handleBack = () => {
        router.back();
    };

    const handleEdit = () => {
        router.push(`/admin/coupons/${params.id}/edit`);
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'PERCENTAGE': return 'Phần trăm';
            case 'FIXED_AMOUNT': return 'Số tiền cố định';
            case 'FREE_SHIPPING': return 'Miễn phí vận chuyển';
            case 'CASHBACK': return 'Hoàn tiền';
            default: return type;
        }
    };

    const getScopeLabel = (scope: string) => {
        switch (scope) {
            case 'PLATFORM_WIDE': return 'Toàn platform';
            case 'CATEGORY': return 'Danh mục';
            case 'BRAND': return 'Thương hiệu';
            case 'FIRST_ORDER': return 'Đơn hàng đầu';
            case 'NEW_USER': return 'User mới';
            default: return scope;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'PERCENTAGE': return Percent;
            case 'FIXED_AMOUNT': return DollarSign;
            case 'FREE_SHIPPING': return Truck;
            case 'CASHBACK': return RefreshCw;
            default: return Ticket;
        }
    };

    const getStatusBadge = (coupon: Coupon) => {
        const now = new Date();
        const isExpired = new Date(coupon.endDate) < now;
        const isNotStarted = new Date(coupon.startDate) > now;
        const isReachedLimit = coupon.totalLimit && coupon.usedCount >= coupon.totalLimit;

        if (!coupon.isActive) return <Badge variant="destructive">Tạm ngưng</Badge>;
        if (isExpired) return <Badge variant="destructive">Hết hạn</Badge>;
        if (isNotStarted) return <Badge variant="secondary">Chưa bắt đầu</Badge>;
        if (isReachedLimit) return <Badge variant="destructive">Hết lượt</Badge>;
        return <Badge variant="default">Đang hoạt động</Badge>;
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                                <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                                <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (!coupon) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Coupon không tồn tại</h1>
                </div>
            </div>
        );
    }

    const TypeIcon = getTypeIcon(coupon.type);
    const usagePercentage = coupon.totalLimit ? (coupon.usedCount / coupon.totalLimit) * 100 : 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">{coupon.name}</h1>
                    <p className="text-muted-foreground">Chi tiết coupon</p>
                </div>
                <Button onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TypeIcon className="h-5 w-5" />
                            Thông tin cơ bản
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Mã coupon</p>
                                <p className="font-mono text-lg font-bold">{coupon.code}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Trạng thái</p>
                                <div className="mt-1">{getStatusBadge(coupon)}</div>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Mô tả</p>
                            <p className="text-sm">{coupon.description || 'Không có mô tả'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Loại</p>
                                <Badge variant="outline">{getTypeLabel(coupon.type)}</Badge>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Phạm vi</p>
                                <Badge variant="outline">{getScopeLabel(coupon.scope)}</Badge>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Giá trị giảm giá</p>
                            <p className="text-2xl font-bold">
                                {coupon.type === 'PERCENTAGE'
                                    ? `${coupon.discountValue}%`
                                    : `${coupon.discountValue.toLocaleString()}đ`
                                }
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Usage Statistics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Thống kê sử dụng
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Đã sử dụng</p>
                                <p className="text-2xl font-bold">{coupon.usedCount}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Giới hạn tổng</p>
                                <p className="text-2xl font-bold">{coupon.totalLimit || 'Không giới hạn'}</p>
                            </div>
                        </div>

                        {coupon.totalLimit && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Tỷ lệ sử dụng</p>
                                <div className="mt-2">
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <div
                                            className="bg-primary h-2 rounded-full transition-all"
                                            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {usagePercentage.toFixed(1)}% đã sử dụng
                                    </p>
                                </div>
                            </div>
                        )}

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Giới hạn mỗi user</p>
                            <p className="text-lg font-medium">{coupon.userLimit || 'Không giới hạn'}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Conditions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Điều kiện áp dụng
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Giá trị đơn hàng tối thiểu</p>
                                <p className="text-lg font-medium">
                                    {coupon.minOrderAmount
                                        ? `${coupon.minOrderAmount.toLocaleString()}đ`
                                        : 'Không có'
                                    }
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Giảm giá tối đa</p>
                                <p className="text-lg font-medium">
                                    {coupon.maxDiscountAmount
                                        ? `${coupon.maxDiscountAmount.toLocaleString()}đ`
                                        : 'Không có'
                                    }
                                </p>
                            </div>
                        </div>

                        {(coupon.categoryIds || coupon.brandIds || coupon.storeIds) && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Phạm vi áp dụng</p>
                                <div className="mt-2 space-y-1">
                                    {coupon.categoryIds && (
                                        <p className="text-sm">Danh mục: {coupon.categoryIds}</p>
                                    )}
                                    {coupon.brandIds && (
                                        <p className="text-sm">Thương hiệu: {coupon.brandIds}</p>
                                    )}
                                    {coupon.storeIds && (
                                        <p className="text-sm">Cửa hàng: {coupon.storeIds}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Time Period */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Thời gian hiệu lực
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Bắt đầu</p>
                            <p className="text-lg font-medium">
                                {format(new Date(coupon.startDate), 'dd/MM/yyyy HH:mm', { locale: vi })}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Kết thúc</p>
                            <p className="text-lg font-medium">
                                {format(new Date(coupon.endDate), 'dd/MM/yyyy HH:mm', { locale: vi })}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Thời gian còn lại</p>
                            <p className="text-lg font-medium">
                                {(() => {
                                    const now = new Date();
                                    const end = new Date(coupon.endDate);
                                    const diff = end.getTime() - now.getTime();
                                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

                                    if (diff < 0) return 'Đã hết hạn';
                                    if (days > 0) return `${days} ngày ${hours} giờ`;
                                    return `${hours} giờ`;
                                })()}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CouponDetailPage; 