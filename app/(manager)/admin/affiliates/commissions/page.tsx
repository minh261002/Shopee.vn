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
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const router = useRouter();

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
        fetchCommissions(1, statusFilter, '');
    }, [statusFilter]);

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

            {/* Filters */}
            <div className="flex items-center space-x-2">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-input bg-background px-3 py-2 text-sm rounded-md"
                >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="pending">Chờ thanh toán</option>
                    <option value="approved">Đã phê duyệt</option>
                    <option value="paid">Đã thanh toán</option>
                </select>
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
                        isLoading={isLoading}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default CommissionsPage; 