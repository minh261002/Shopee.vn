"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Calendar, Target, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/dataTables/data-table';
import { DataTableRowActions } from '@/components/dataTables/data-table-row-actions';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/axios';
import type { Campaign, CampaignsResponse } from '@/types/campaign';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const CampaignsPage = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const router = useRouter();

    // Fetch campaigns
    const fetchCampaigns = async (page = 1, search = '') => {
        try {
            setIsLoading(true);
            const params = {
                page: page.toString(),
                limit: '10',
                ...(search && { search }),
            };

            const response = await api.get('/admin/campaigns', { params });
            const data: CampaignsResponse = response.data;
            setCampaigns(data.campaigns);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            toast.error('Lỗi khi tải danh sách chiến dịch');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    // Handle delete
    const handleDelete = async (campaign: Campaign) => {
        try {
            await api.delete(`/admin/campaigns/${campaign.id}`);
            toast.success('Xóa chiến dịch thành công');
            fetchCampaigns();
        } catch (error) {
            console.error('Error deleting campaign:', error);
            toast.error('Lỗi khi xóa chiến dịch');
        }
    };

    // Handle edit
    const handleEdit = (campaign: Campaign) => {
        router.push(`/admin/campaigns/${campaign.id}/edit`);
    };

    // Handle view
    const handleView = (campaign: Campaign) => {
        router.push(`/admin/campaigns/${campaign.id}`);
    };

    // Handle add new
    const handleAddNew = () => {
        router.push('/admin/campaigns/new');
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

    const columns: ColumnDef<Campaign>[] = [
        {
            accessorKey: 'name',
            header: 'Tên chiến dịch',
            cell: ({ row }) => (
                <div className="font-medium max-w-[200px] truncate">
                    {row.original.name}
                </div>
            ),
        },
        {
            accessorKey: 'campaignType',
            header: 'Loại',
            cell: ({ row }) => (
                <Badge variant="outline" className="text-xs">
                    {getCampaignTypeLabel(row.original.campaignType || '')}
                </Badge>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Trạng thái',
            cell: ({ row }) => (
                <Badge className={`text-xs ${getStatusColor(row.original.status)}`}>
                    {getStatusLabel(row.original.status)}
                </Badge>
            ),
        },
        {
            accessorKey: 'budget',
            header: 'Ngân sách',
            cell: ({ row }) => (
                <div className="text-sm">
                    {row.original.budget ? formatCurrency(row.original.budget) : 'Chưa thiết lập'}
                </div>
            ),
        },
        {
            accessorKey: 'targetAudience',
            header: 'Đối tượng',
            cell: ({ row }) => (
                <div className="text-xs text-muted-foreground max-w-[150px] truncate">
                    {getTargetAudienceLabel(row.original.targetAudience)}
                </div>
            ),
        },
        {
            accessorKey: 'geographicTarget',
            header: 'Khu vực',
            cell: ({ row }) => (
                <div className="text-xs text-muted-foreground max-w-[120px] truncate">
                    {getGeographicTargetLabel(row.original.geographicTarget)}
                </div>
            ),
        },
        {
            accessorKey: 'startDate',
            header: 'Thời gian',
            cell: ({ row }) => (
                <div className="text-xs text-muted-foreground">
                    {row.original.startDate && row.original.endDate ? (
                        <div>
                            <div>Từ: {format(new Date(row.original.startDate), 'dd/MM/yyyy', { locale: vi })}</div>
                            <div>Đến: {format(new Date(row.original.endDate), 'dd/MM/yyyy', { locale: vi })}</div>
                        </div>
                    ) : (
                        'Chưa thiết lập'
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'contentBlocks',
            header: 'Số banner',
            cell: ({ row }) => (
                <div className="text-sm">
                    {row.original._count?.contentBlocks || 0} banner
                </div>
            ),
        },
        {
            accessorKey: 'isFeatured',
            header: 'Nổi bật',
            cell: ({ row }) => (
                <div>
                    {row.original.isFeatured ? (
                        <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                            Nổi bật
                        </Badge>
                    ) : (
                        <Badge variant="secondary">Bình thường</Badge>
                    )}
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
                            onClick: () => handleView(row.original),
                        },
                        {
                            label: 'Chỉnh sửa',
                            icon: Edit,
                            onClick: () => handleEdit(row.original),
                        },
                        {
                            label: 'Xóa',
                            icon: Trash2,
                            onClick: () => handleDelete(row.original),
                            variant: 'destructive',
                        },
                    ]}
                />
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý chiến dịch</h1>
                    <p className="text-muted-foreground">
                        Quản lý các chiến dịch marketing và quảng cáo
                    </p>
                </div>
                <Button onClick={handleAddNew}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo chiến dịch mới
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng chiến dịch</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pagination.total}</div>
                        <p className="text-xs text-muted-foreground">
                            Tất cả chiến dịch
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {campaigns.filter(c => c.status === 'PUBLISHED').length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Chiến dịch đang chạy
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Bản nháp</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {campaigns.filter(c => c.status === 'DRAFT').length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Chiến dịch chưa xuất bản
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Nổi bật</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {campaigns.filter(c => c.isFeatured).length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Chiến dịch nổi bật
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách chiến dịch</CardTitle>
                    <CardDescription>
                        Quản lý tất cả chiến dịch marketing và quảng cáo
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={campaigns}
                        searchKey="name"
                        searchPlaceholder="Tìm kiếm chiến dịch..."
                        isLoading={isLoading}
                        emptyMessage="Không có chiến dịch nào."
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default CampaignsPage; 