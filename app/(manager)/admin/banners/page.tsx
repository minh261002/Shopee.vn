"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Calendar, Target, Smartphone, Monitor, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/dataTables/data-table';
import { DataTableRowActions } from '@/components/dataTables/data-table-row-actions';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import { api } from '@/lib/axios';
import type { ContentBlock, BannersResponse } from '@/types/banner';

const BannerPage = () => {
    const [banners, setBanners] = useState<ContentBlock[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const router = useRouter();

    // Fetch banners
    const fetchBanners = async (page = 1, search = '') => {
        try {
            setIsLoading(true);
            const params = {
                page: page.toString(),
                limit: '10',
                ...(search && { search }),
            };

            const response = await api.get('/admin/banners', { params });
            const data: BannersResponse = response.data;
            setBanners(data.banners);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching banners:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    // Handle delete
    const handleDelete = async (banner: ContentBlock) => {
        try {
            await api.delete(`/admin/banners/${banner.id}`);
            toast.success('Xóa banner thành công');
            fetchBanners();
        } catch (error) {
            console.error('Error deleting banner:', error);
        }
    };

    // Handle edit
    const handleEdit = (banner: ContentBlock) => {
        router.push(`/admin/banners/${banner.id}/edit`);
    };

    // Handle view
    const handleView = (banner: ContentBlock) => {
        router.push(`/admin/banners/${banner.id}`);
    };

    // Handle add new
    const handleAddNew = () => {
        router.push('/admin/banners/new');
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
                    <div className="relative w-24 h-12 rounded-lg overflow-hidden">
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
            id: 'itemCount',
            header: 'Số ảnh',
            cell: ({ row }) => (
                <div className="text-center">
                    <Badge variant="outline">
                        {row.original._count?.items || row.original.items?.length || 0}
                    </Badge>
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
            accessorKey: 'campaign',
            header: 'Chiến dịch',
            cell: ({ row }) => (
                <div className="text-xs text-muted-foreground max-w-[150px] truncate">
                    {row.original.campaign ? (
                        <Badge variant="outline" className="text-xs">
                            {row.original.campaign.name}
                        </Badge>
                    ) : (
                        <span className="text-gray-400">Không có</span>
                    )}
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
            accessorKey: 'showOnMobile',
            header: 'Thiết bị',
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    {row.original.showOnMobile && <Smartphone className="h-3 w-3 text-blue-500" />}
                    {row.original.showOnDesktop && <Monitor className="h-3 w-3 text-green-500" />}
                    {row.original.showOnTablet && <Globe className="h-3 w-3 text-purple-500" />}
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
                            label: 'Xem',
                            onClick: handleView,
                            icon: Eye,
                        },
                        {
                            label: 'Chỉnh sửa',
                            onClick: handleEdit,
                            icon: Edit,
                        },
                        {
                            label: 'Xóa',
                            onClick: handleDelete,
                            icon: Trash2,
                            variant: 'destructive',
                            separator: true,
                            confirmTitle: 'Xác nhận xóa banner',
                            confirmMessage: `Bạn có chắc chắn muốn xóa banner "${row.original.title}"? Hành động này không thể hoàn tác.`,
                        },
                    ]}
                />
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className='flex items-center justify-between'>
                    <div>
                        <CardTitle>Quản lý Banner</CardTitle>
                        <CardDescription>
                            Tổng cộng {pagination.total} banner
                        </CardDescription>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" onClick={() => router.push('/admin/campaigns')}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Chiến dịch
                        </Button>
                        <Button onClick={handleAddNew}>
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm banner
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={banners}
                        isLoading={isLoading}
                        searchKey="title"
                        searchPlaceholder="Tìm kiếm banner..."
                        emptyMessage="Không có banner nào."
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default BannerPage; 