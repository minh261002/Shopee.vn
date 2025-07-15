"use client";

import React, { useState, useEffect } from 'react';
import { DollarSign, UserCheck, Eye } from 'lucide-react';
import { DataTable } from '@/components/dataTables/data-table';
import { DataTableRowActions } from '@/components/dataTables/data-table-row-actions';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/axios';
import type { AffiliateCommission } from '@/types/affiliate';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FilterOption } from '@/components/dataTables/data-table-toolbar';

interface CommissionsResponse {
    commissions: AffiliateCommission[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    stats: {
        totalCommission: number;
        pendingCommission: number;
        paidCommission: number;
    };
}

const CommissionsPage = () => {
    const [commissions, setCommissions] = useState<AffiliateCommission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCommission: 0,
        pendingCommission: 0,
        paidCommission: 0,
    });
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
        status: 'ALL'
    });
    const router = useRouter();

    // Define filters
    const filters: FilterOption[] = [
        {
            key: 'status',
            label: 'Trạng thái',
            type: 'select',
            placeholder: 'Chọn trạng thái',
            options: [
                { value: 'pending', label: 'Chờ thanh toán' },
                { value: 'approved', label: 'Đã phê duyệt' },
                { value: 'paid', label: 'Đã thanh toán' }
            ]
        }
    ];

    // Fetch commissions
    const fetchCommissions = async (page = 1, status = '', affiliateId = '') => {
        try {
            setIsLoading(true);
            const params = {
                page: page.toString(),
                limit: '10',
                ...(status && status !== 'ALL' && { status }),
                ...(affiliateId && { affiliateId }),
            };

            const response = await api.get('/admin/affiliates/commissions', { params });
            const data: CommissionsResponse = response.data;
            setCommissions(data.commissions);
            setStats(data.stats);
        } catch (error) {
            console.error('Error fetching commissions:', error);
            toast.error('Lỗi khi tải danh sách hoa hồng');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCommissions(1, activeFilters.status, '');
    }, [activeFilters.status]);

    // Handle filter change
    const handleFilterChange = (key: string, value: string) => {
        setActiveFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Handle clear filters
    const handleClearFilters = () => {
        setActiveFilters({
            status: 'ALL'
        });
    };

    // Handle export
    const handleExport = () => {
        toast.info('Tính năng xuất dữ liệu đang được phát triển');
    };

    // Handle refresh
    const handleRefresh = () => {
        fetchCommissions(1, activeFilters.status, '');
    };

    // Handle view
    const handleView = (commission: AffiliateCommission) => {
        router.push(`/admin/affiliates/${commission.affiliateId}`);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <Badge variant="default">Đã thanh toán</Badge>;
            case 'pending':
                return <Badge variant="secondary">Chờ thanh toán</Badge>;
            case 'approved':
                return <Badge variant="outline">Đã phê duyệt</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const columns: ColumnDef<AffiliateCommission>[] = [
        {
            accessorKey: "affiliate",
            header: "Affiliate",
            cell: ({ row }) => {
                const commission = row.original;
                return (
                    <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserCheck className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <div className="font-medium">{commission.affiliate?.user?.name}</div>
                            <div className="text-sm text-muted-foreground">{commission.affiliate?.user?.email}</div>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "order",
            header: "Đơn hàng",
            cell: ({ row }) => {
                const commission = row.original;
                return (
                    <div>
                        <div className="font-medium">#{commission.order?.orderNumber}</div>
                        <div className="text-sm text-muted-foreground">
                            {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(commission.orderAmount)}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "commissionAmount",
            header: "Hoa hồng",
            cell: ({ row }) => (
                <div className="font-medium text-green-600">
                    {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                    }).format(row.getValue("commissionAmount"))}
                </div>
            ),
        },
        {
            accessorKey: "commissionRate",
            header: "Tỷ lệ",
            cell: ({ row }) => (
                <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span>{row.getValue("commissionRate")}%</span>
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Trạng thái",
            cell: ({ row }) => getStatusBadge(row.getValue("status")),
        },
        {
            accessorKey: "createdAt",
            header: "Ngày tạo",
            cell: ({ row }) => (
                <div className="text-sm text-muted-foreground">
                    {format(new Date(row.getValue("createdAt")), 'dd/MM/yyyy', { locale: vi })}
                </div>
            ),
        },
        {
            id: "actions",
            header: "Thao tác",
            cell: ({ row }) => {
                const commission = row.original;
                const actions = [
                    {
                        label: "Xem affiliate",
                        icon: Eye,
                        onClick: () => handleView(commission),
                    },
                ];

                return (
                    <DataTableRowActions
                        row={row}
                        actions={actions}
                    />
                );
            },
        },
    ];

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng hoa hồng</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(stats.totalCommission)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Chờ thanh toán</CardTitle>
                        <DollarSign className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(stats.pendingCommission)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đã thanh toán</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(stats.paidCommission)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Data Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách Hoa hồng</CardTitle>
                    <CardDescription>
                        Quản lý hoa hồng của các affiliate
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={commissions}
                        searchKey="affiliate"
                        searchPlaceholder="Tìm kiếm affiliate..."
                        isLoading={isLoading}
                        emptyMessage="Không có hoa hồng nào."
                        filters={filters}
                        activeFilters={activeFilters}
                        onFilterChange={handleFilterChange}
                        onClearFilters={handleClearFilters}
                        onExport={handleExport}
                        onRefresh={handleRefresh}
                        showToolbar={true}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default CommissionsPage; 