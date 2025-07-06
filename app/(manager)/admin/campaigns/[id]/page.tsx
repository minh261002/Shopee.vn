"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Calendar, Target, Users, TrendingUp, Eye, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { api } from '@/lib/axios';
import type { Campaign } from '@/types/campaign';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Image from 'next/image';

const CampaignDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                setIsLoading(true);
                const response = await api.get(`/admin/campaigns/${params.id}`);
                setCampaign(response.data);
            } catch (error) {
                console.error('Error fetching campaign:', error);
                toast.error('Lỗi khi tải thông tin chiến dịch');
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchCampaign();
        }
    }, [params.id]);

    const handleBack = () => {
        router.back();
    };

    const handleEdit = () => {
        router.push(`/admin/campaigns/${params.id}/edit`);
    };

    const handleAddBanner = () => {
        router.push(`/admin/banners/new?campaignId=${params.id}`);
    };

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
            case 'EXPIRED':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        const statusLabels: Record<string, string> = {
            'PUBLISHED': 'Đã xuất bản',
            'DRAFT': 'Bản nháp',
            'SCHEDULED': 'Đã lên lịch',
            'PAUSED': 'Tạm dừng',
            'ARCHIVED': 'Đã lưu trữ',
            'EXPIRED': 'Hết hạn',
        };
        return statusLabels[status] || status;
    };

    const getCampaignTypeLabel = (type: string) => {
        const typeLabels: Record<string, string> = {
            'FLASH_SALE': 'Flash Sale',
            'SEASONAL': 'Theo mùa',
            'BRAND': 'Thương hiệu',
        };
        return typeLabels[type] || type;
    };

    const getTargetAudienceLabel = (audience: string) => {
        const audienceLabels: Record<string, string> = {
            'ALL_USERS': 'Tất cả người dùng',
            'NEW_USERS': 'Người dùng mới',
            'RETURNING_USERS': 'Người dùng quay lại',
            'PREMIUM_USERS': 'Người dùng cao cấp',
            'MOBILE_USERS': 'Người dùng mobile',
            'DESKTOP_USERS': 'Người dùng desktop',
            'SPECIFIC_LOCATION': 'Vị trí cụ thể',
            'SPECIFIC_DEVICE': 'Thiết bị cụ thể',
        };
        return audienceLabels[audience] || audience;
    };

    const getGeographicTargetLabel = (target: string) => {
        const targetLabels: Record<string, string> = {
            'ALL_VIETNAM': 'Toàn Việt Nam',
            'NORTH_VIETNAM': 'Miền Bắc',
            'CENTRAL_VIETNAM': 'Miền Trung',
            'SOUTH_VIETNAM': 'Miền Nam',
            'HANOI': 'Hà Nội',
            'HO_CHI_MINH': 'TP. Hồ Chí Minh',
            'DA_NANG': 'Đà Nẵng',
            'SPECIFIC_CITY': 'Thành phố cụ thể',
        };
        return targetLabels[target] || target;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Chi tiết chiến dịch</h1>
                        <p className="text-muted-foreground">Đang tải...</p>
                    </div>
                </div>
                <div className="animate-pulse space-y-4">
                    <div className="h-32 bg-gray-200 rounded-lg"></div>
                    <div className="h-32 bg-gray-200 rounded-lg"></div>
                    <div className="h-32 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Chi tiết chiến dịch</h1>
                        <p className="text-muted-foreground">Không tìm thấy chiến dịch</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
                        <p className="text-muted-foreground">
                            Chi tiết chiến dịch marketing và quảng cáo
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push(`/admin/campaigns/${params.id}/banners`)}>
                        <Target className="mr-2 h-4 w-4" />
                        Xem banner ({campaign._count?.contentBlocks || 0})
                    </Button>
                    <Button onClick={handleEdit}>
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                    </Button>
                    <Button onClick={handleAddBanner}>
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm banner
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Thông tin cơ bản */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Thông tin cơ bản
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Trạng thái:</span>
                            <Badge className={getStatusColor(campaign.status)}>
                                {getStatusLabel(campaign.status)}
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Loại chiến dịch:</span>
                            <Badge variant="outline">
                                {getCampaignTypeLabel(campaign.campaignType || '')}
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Nổi bật:</span>
                            <Badge variant={campaign.isFeatured ? "default" : "secondary"}>
                                {campaign.isFeatured ? 'Có' : 'Không'}
                            </Badge>
                        </div>
                        {campaign.description && (
                            <div>
                                <span className="text-sm font-medium">Mô tả:</span>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {campaign.description}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Thời gian và ngân sách */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Thời gian và ngân sách
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Ngày bắt đầu:</span>
                            <span className="text-sm">
                                {campaign.startDate
                                    ? format(new Date(campaign.startDate), 'dd/MM/yyyy HH:mm', { locale: vi })
                                    : 'Chưa thiết lập'
                                }
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Ngày kết thúc:</span>
                            <span className="text-sm">
                                {campaign.endDate
                                    ? format(new Date(campaign.endDate), 'dd/MM/yyyy HH:mm', { locale: vi })
                                    : 'Chưa thiết lập'
                                }
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Ngân sách:</span>
                            <span className="text-sm">
                                {campaign.budget ? formatCurrency(campaign.budget) : 'Chưa thiết lập'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Mục tiêu doanh thu:</span>
                            <span className="text-sm">
                                {campaign.targetRevenue ? formatCurrency(campaign.targetRevenue) : 'Chưa thiết lập'}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Đối tượng mục tiêu */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Đối tượng mục tiêu
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Đối tượng:</span>
                            <span className="text-sm">
                                {getTargetAudienceLabel(campaign.targetAudience)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Khu vực:</span>
                            <span className="text-sm">
                                {getGeographicTargetLabel(campaign.geographicTarget)}
                            </span>
                        </div>
                        {campaign.targetLocations && (
                            <div>
                                <span className="text-sm font-medium">Vị trí cụ thể:</span>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {campaign.targetLocations}
                                </p>
                            </div>
                        )}
                        {campaign.targetDevices && (
                            <div>
                                <span className="text-sm font-medium">Thiết bị mục tiêu:</span>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {campaign.targetDevices}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Mục tiêu chiến dịch */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Mục tiêu chiến dịch
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Mục tiêu hiển thị:</span>
                            <span className="text-sm">
                                {campaign.targetImpressions?.toLocaleString() || 'Chưa thiết lập'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Mục tiêu click:</span>
                            <span className="text-sm">
                                {campaign.targetClicks?.toLocaleString() || 'Chưa thiết lập'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Mục tiêu chuyển đổi:</span>
                            <span className="text-sm">
                                {campaign.targetConversions?.toLocaleString() || 'Chưa thiết lập'}
                            </span>
                        </div>
                        {campaign.conditions && (
                            <div>
                                <span className="text-sm font-medium">Điều kiện hiển thị:</span>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {campaign.conditions}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Danh sách banner */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Banner trong chiến dịch ({campaign.contentBlocks?.length || 0})
                    </CardTitle>
                    <CardDescription>
                        Các banner thuộc chiến dịch này
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {campaign.contentBlocks && campaign.contentBlocks.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {campaign.contentBlocks.map((banner) => (
                                <Card key={banner.id} className="overflow-hidden">
                                    <div className="relative h-32">
                                        {banner.items && banner.items[0] ? (
                                            <Image
                                                src={banner.items[0].image}
                                                alt={banner.title}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                <span className="text-sm text-gray-500">Không có ảnh</span>
                                            </div>
                                        )}
                                    </div>
                                    <CardContent className="p-4">
                                        <h3 className="font-medium text-sm mb-2">{banner.title}</h3>
                                        <div className="flex gap-2">
                                            <Badge variant="outline" className="text-xs">
                                                {banner.type}
                                            </Badge>
                                            <Badge className={`text-xs ${getStatusColor(banner.status)}`}>
                                                {getStatusLabel(banner.status)}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">Chưa có banner nào trong chiến dịch</p>
                            <Button onClick={handleAddBanner} className="mt-4">
                                <Plus className="mr-2 h-4 w-4" />
                                Thêm banner đầu tiên
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default CampaignDetailPage; 