"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Calendar, Target, Smartphone, Monitor, Globe, ExternalLink } from 'lucide-react';
import { api } from '@/lib/axios';
import type { ContentBlock } from '@/types/banner';
import Image from 'next/image';
import { Label } from '@/components/ui/label';

const BannerDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const [banner, setBanner] = useState<ContentBlock | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const response = await api.get(`/admin/banners/${params.id}`);
                setBanner(response.data);
            } catch (error) {
                console.error('Error fetching banner:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchBanner();
        }
    }, [params.id]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PUBLISHED':
                return 'bg-green-100 text-green-800';
            case 'DRAFT':
                return 'bg-gray-100 text-gray-800';
            case 'SCHEDULED':
                return 'bg-blue-100 text-blue-800';
            case 'PAUSED':
                return 'bg-yellow-100 text-yellow-800';
            case 'ARCHIVED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeLabel = (type: string) => {
        const typeLabels: Record<string, string> = {
            'HERO_BANNER': 'Banner chính',
            'FLASH_SALE_BANNER': 'Flash Sale',
            'CATEGORY_BANNER': 'Danh mục',
            'BRAND_BANNER': 'Thương hiệu',
            'PRODUCT_BANNER': 'Sản phẩm',
            'PROMOTION_BANNER': 'Khuyến mãi',
            'SEASONAL_BANNER': 'Theo mùa',
            'SIDEBAR_BANNER': 'Sidebar',
            'CHECKOUT_BANNER': 'Thanh toán',
            'CART_BANNER': 'Giỏ hàng',
            'SEARCH_BANNER': 'Tìm kiếm',
        };
        return typeLabels[type] || type;
    };

    const getPositionLabel = (position: string) => {
        const positionLabels: Record<string, string> = {
            'HOMEPAGE_HERO': 'Trang chủ - Hero',
            'HOMEPAGE_FEATURED': 'Trang chủ - Nổi bật',
            'HOMEPAGE_SIDEBAR': 'Trang chủ - Sidebar',
            'CATEGORY_HEADER': 'Danh mục - Header',
            'CATEGORY_SIDEBAR': 'Danh mục - Sidebar',
            'PRODUCT_DETAIL_TOP': 'Sản phẩm - Top',
            'PRODUCT_DETAIL_SIDEBAR': 'Sản phẩm - Sidebar',
            'CHECKOUT_PAGE': 'Thanh toán',
            'CART_PAGE': 'Giỏ hàng',
            'SEARCH_RESULTS': 'Kết quả tìm kiếm',
            'FLASH_SALE_PAGE': 'Flash Sale',
            'BRAND_PAGE': 'Thương hiệu',
        };
        return positionLabels[position] || position;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (!banner) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Không tìm thấy banner</h2>
                <p className="text-muted-foreground mb-4">
                    Banner bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
                </p>
                <Button onClick={() => router.push('/admin/banners')}>
                    Quay lại danh sách
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{banner.title}</h1>
                        <p className="text-muted-foreground">
                            Chi tiết banner
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => router.push(`/admin/banners/${banner.id}/edit`)}
                    className="flex items-center gap-2"
                >
                    <Edit className="h-4 w-4" />
                    Chỉnh sửa
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Thông tin chính */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin cơ bản</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Loại banner
                                    </Label>
                                    <p className="mt-1">
                                        <Badge variant="outline">
                                            {getTypeLabel(banner.type)}
                                        </Badge>
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Vị trí hiển thị
                                    </Label>
                                    <p className="mt-1 text-sm">
                                        {getPositionLabel(banner.position)}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Trạng thái
                                    </Label>
                                    <p className="mt-1">
                                        <Badge className={getStatusColor(banner.status)}>
                                            {banner.status}
                                        </Badge>
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Độ ưu tiên
                                    </Label>
                                    <p className="mt-1 text-sm">{banner.priority}</p>
                                </div>
                            </div>
                            {banner.description && (
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Mô tả
                                    </Label>
                                    <p className="mt-1 text-sm">{banner.description}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Thời gian hiển thị */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Thời gian hiển thị
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Ngày bắt đầu
                                    </Label>
                                    <p className="mt-1 text-sm">
                                        {banner.startDate ? new Date(banner.startDate).toLocaleString('vi-VN') : 'Không có'}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Ngày kết thúc
                                    </Label>
                                    <p className="mt-1 text-sm">
                                        {banner.endDate ? new Date(banner.endDate).toLocaleString('vi-VN') : 'Không có'}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">
                                    Trạng thái hoạt động
                                </Label>
                                <p className="mt-1">
                                    {banner.isActive ? (
                                        <Badge variant="default" className="bg-green-100 text-green-800">
                                            Đang hoạt động
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary">Tạm dừng</Badge>
                                    )}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Đối tượng mục tiêu */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                Đối tượng mục tiêu
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Đối tượng
                                    </Label>
                                    <p className="mt-1 text-sm">{banner.targetAudience}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Khu vực địa lý
                                    </Label>
                                    <p className="mt-1 text-sm">{banner.geographicTarget}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Thiết bị hiển thị */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thiết bị hiển thị</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    {banner.showOnMobile ? (
                                        <Smartphone className="h-4 w-4 text-blue-500" />
                                    ) : (
                                        <Smartphone className="h-4 w-4 text-gray-300" />
                                    )}
                                    <span className="text-sm">Mobile</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {banner.showOnTablet ? (
                                        <Globe className="h-4 w-4 text-purple-500" />
                                    ) : (
                                        <Globe className="h-4 w-4 text-gray-300" />
                                    )}
                                    <span className="text-sm">Tablet</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {banner.showOnDesktop ? (
                                        <Monitor className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Monitor className="h-4 w-4 text-gray-300" />
                                    )}
                                    <span className="text-sm">Desktop</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Nội dung banner */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Nội dung banner</CardTitle>
                            <CardDescription>
                                {banner.items?.length || 0} ảnh
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {banner.items && banner.items.length > 0 ? (
                                banner.items.map((item, index) => (
                                    <div key={index} className="border rounded-lg p-3">
                                        <div className="relative w-full h-32 rounded overflow-hidden mb-2">
                                            <Image
                                                src={item.image}
                                                alt={item.title || 'Banner item'}
                                                className="w-full h-full object-cover"
                                                width={300}
                                                height={100}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-medium text-sm">
                                                {item.title || 'Không có tiêu đề'}
                                            </p>
                                            {item.linkUrl && (
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <ExternalLink className="h-3 w-3" />
                                                    <a
                                                        href={item.linkUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:underline"
                                                    >
                                                        {item.linkText || item.linkUrl}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground py-4">
                                    Chưa có nội dung
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Thông tin khác */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin khác</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">
                                    Ngày tạo
                                </Label>
                                <p className="mt-1 text-sm">
                                    {new Date(banner.createdAt).toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">
                                    Cập nhật lần cuối
                                </Label>
                                <p className="mt-1 text-sm">
                                    {new Date(banner.updatedAt).toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                            {banner.campaign && (
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Chiến dịch
                                    </Label>
                                    <p className="mt-1 text-sm">{banner.campaign.name}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default BannerDetailPage; 