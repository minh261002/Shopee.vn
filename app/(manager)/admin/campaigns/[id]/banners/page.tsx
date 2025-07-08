"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, ArrowLeft, Eye, Edit, Trash2, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/dataTables/data-table';
import { DataTableRowActions } from '@/components/dataTables/data-table-row-actions';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { api } from '@/lib/axios';
import type { ContentBlock } from '@/types/banner';
import type { Campaign } from '@/types/campaign';
import Image from 'next/image';

const CampaignBannersPage = () => {
    const router = useRouter();
    const params = useParams();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [banners, setBanners] = useState<ContentBlock[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [campaignResponse, bannersResponse] = await Promise.all([
                    api.get(`/admin/campaigns/${params.id}`),
                    api.get(`/admin/banners?campaignId=${params.id}&limit=100`)
                ]);

                setCampaign(campaignResponse.data);
                setBanners(bannersResponse.data.banners);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Lỗi khi tải dữ liệu');
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchData();
        }
    }, [params.id]);

    const handleAddBanner = () => {
        router.push(`/admin/banners/new?campaignId=${params.id}`);
    };

    const handleViewBanner = (banner: ContentBlock) => {
        router.push(`/admin/banners/${banner.id}`);
    };

    const handleEditBanner = (banner: ContentBlock) => {
        router.push(`/admin/banners/${banner.id}/edit`);
    };

    const handleDeleteBanner = async (banner: ContentBlock) => {
        try {
            await api.delete(`/admin/banners/${banner.id}`);
            toast.success('Xóa banner thành công');
            // Refresh data
            const response = await api.get(`/admin/banners?campaignId=${params.id}&limit=100`);
            setBanners(response.data.banners);
        } catch (error) {
            console.error('Error deleting banner:', error);
            toast.error('Lỗi khi xóa banner');
        }
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

    const columns: ColumnDef<ContentBlock>[] = [
        {
            accessorKey: 'items',
            header: 'Ảnh',
            cell: ({ row }) => {
                const firstItem = row.original.items?.[0];
                return firstItem ? (
                    <div className="relative w-16 h-12 rounded-lg overflow-hidden">
                        <Image
                            src={firstItem.image}
                            alt={firstItem.title || 'Banner'}
                            fill
                            className="object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-500">No image</span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'title',
            header: 'Tiêu đề',
            cell: ({ row }) => (
                <div className="font-medium max-w-[200px] truncate">
                    {row.original.title}
                </div>
            ),
        },
        {
            accessorKey: 'type',
            header: 'Loại',
            cell: ({ row }) => (
                <Badge variant="outline" className="text-xs">
                    {getTypeLabel(row.original.type)}
                </Badge>
            ),
        },
        {
            accessorKey: 'position',
            header: 'Vị trí',
            cell: ({ row }) => (
                <div className="text-xs text-muted-foreground max-w-[150px] truncate">
                    {getPositionLabel(row.original.position)}
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Trạng thái',
            cell: ({ row }) => (
                <Badge className={`text-xs ${getStatusColor(row.original.status)}`}>
                    {row.original.status}
                </Badge>
            ),
        },
        {
            accessorKey: 'isActive',
            header: 'Hoạt động',
            cell: ({ row }) => (
                <div>
                    {row.original.isActive ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                            Đang hoạt động
                        </Badge>
                    ) : (
                        <Badge variant="secondary">Tạm dừng</Badge>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'priority',
            header: 'Ưu tiên',
            cell: ({ row }) => (
                <div className="text-center">
                    <Badge variant="outline">
                        {row.original.priority}
                    </Badge>
                </div>
            ),
        },
        {
            accessorKey: 'targetAudience',
            header: 'Đối tượng',
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <Target className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                        {row.original.targetAudience === 'ALL_USERS' ? 'Tất cả' : row.original.targetAudience}
                    </span>
                </div>
            ),
        },
        {
            id: 'actions',
            header: 'Thao tác',
            cell: ({ row }) => (
                <DataTableRowActions
                    row={row}
                    actions={[
                        {
                            label: 'Xem chi tiết',
                            icon: Eye,
                            onClick: () => handleViewBanner(row.original),
                        },
                        {
                            label: 'Chỉnh sửa',
                            icon: Edit,
                            onClick: () => handleEditBanner(row.original),
                        },
                        {
                            label: 'Xóa',
                            icon: Trash2,
                            onClick: () => handleDeleteBanner(row.original),
                            variant: 'destructive',
                        },
                    ]}
                />
            ),
        },
    ];

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Banner trong chiến dịch: {campaign?.name}
                        </h1>
                        <p className="text-muted-foreground">
                            Quản lý các banner thuộc chiến dịch này
                        </p>
                    </div>
                </div>
                <Button onClick={handleAddBanner}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm banner
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng banner</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{banners.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Banner trong chiến dịch
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {banners.filter(b => b.isActive).length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Banner đang chạy
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đã xuất bản</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {banners.filter(b => b.status === 'PUBLISHED').length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Banner đã xuất bản
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách banner</CardTitle>
                    <CardDescription>
                        Quản lý tất cả banner thuộc chiến dịch này
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={banners}
                        isLoading={isLoading}
                        searchPlaceholder="Tìm kiếm banner..."
                        emptyMessage="Chưa có banner nào trong chiến dịch này."
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default CampaignBannersPage; 