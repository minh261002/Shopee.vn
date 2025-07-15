"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, UserCheck, DollarSign, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/dataTables/data-table';
import { DataTableRowActions } from '@/components/dataTables/data-table-row-actions';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/axios';
import type { Affiliate, AffiliatesResponse } from '@/types/affiliate';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const AffiliatesPage = () => {
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const router = useRouter();

    // Fetch affiliates
    const fetchAffiliates = async (page = 1, status = '') => {
        try {
            setIsLoading(true);
            const params = {
                page: page.toString(),
                limit: '10',
                ...(status && status !== 'ALL' && { status }),
            };

            const response = await api.get('/admin/affiliates', { params });
            const data: AffiliatesResponse = response.data;
            setAffiliates(data.affiliates);
        } catch (error) {
            console.error('Error fetching affiliates:', error);
            toast.error('Lỗi khi tải danh sách affiliate');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAffiliates(1, statusFilter);
    }, [statusFilter]);

    // Handle delete
    const handleDelete = async (affiliate: Affiliate) => {
        try {
            await api.delete(`/admin/affiliates/${affiliate.id}`);
            toast.success('Xóa affiliate thành công');
            fetchAffiliates(1, statusFilter);
        } catch (error) {
            console.error('Error deleting affiliate:', error);
            toast.error('Lỗi khi xóa affiliate');
        }
    };

    // Handle edit
    const handleEdit = (affiliate: Affiliate) => {
        router.push(`/admin/affiliates/${affiliate.id}/edit`);
    };

    // Handle view
    const handleView = (affiliate: Affiliate) => {
        router.push(`/admin/affiliates/${affiliate.id}`);
    };

    // Handle approve
    const handleApprove = async (affiliate: Affiliate) => {
        try {
            await api.put(`/admin/affiliates/${affiliate.id}/approve`);
            toast.success('Phê duyệt affiliate thành công');
            fetchAffiliates(1, statusFilter);
        } catch (error) {
            console.error('Error approving affiliate:', error);
            toast.error('Lỗi khi phê duyệt affiliate');
        }
    };

    // Handle reject
    const handleReject = async (affiliate: Affiliate) => {
        try {
            await api.put(`/admin/affiliates/${affiliate.id}/reject`);
            toast.success('Từ chối affiliate thành công');
            fetchAffiliates(1, statusFilter);
        } catch (error) {
            console.error('Error rejecting affiliate:', error);
            toast.error('Lỗi khi từ chối affiliate');
        }
    };

    // Handle suspend
    const handleSuspend = async (affiliate: Affiliate) => {
        try {
            await api.put(`/admin/affiliates/${affiliate.id}/suspend`, {
                reason: 'Tạm ngưng theo yêu cầu của admin'
            });
            toast.success('Tạm ngưng affiliate thành công');
            fetchAffiliates(1, statusFilter);
        } catch (error) {
            console.error('Error suspending affiliate:', error);
            toast.error('Lỗi khi tạm ngưng affiliate');
        }
    };

    // Handle reactivate
    const handleReactivate = async (affiliate: Affiliate) => {
        try {
            await api.put(`/admin/affiliates/${affiliate.id}/reactivate`);
            toast.success('Kích hoạt lại affiliate thành công');
            fetchAffiliates(1, statusFilter);
        } catch (error) {
            console.error('Error reactivating affiliate:', error);
            toast.error('Lỗi khi kích hoạt lại affiliate');
        }
    };

    // Handle add new
    const handleAddNew = () => {
        router.push('/admin/affiliates/new');
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return <Badge variant="default">Đã phê duyệt</Badge>;
            case 'PENDING':
                return <Badge variant="secondary">Chờ phê duyệt</Badge>;
            case 'SUSPENDED':
                return <Badge variant="destructive">Đã tạm ngưng</Badge>;
            case 'REJECTED':
                return <Badge variant="outline">Đã từ chối</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const columns: ColumnDef<Affiliate>[] = [
        {
            accessorKey: "user",
            header: "Người dùng",
            cell: ({ row }) => {
                const affiliate = row.original;
                return (
                    <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserCheck className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <div className="font-medium">{affiliate.user?.name}</div>
                            <div className="text-sm text-muted-foreground">{affiliate.user?.email}</div>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "status",
            header: "Trạng thái",
            cell: ({ row }) => getStatusBadge(row.getValue("status")),
        },
        {
            accessorKey: "defaultCommissionRate",
            header: "Tỷ lệ hoa hồng",
            cell: ({ row }) => (
                <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span>{row.getValue("defaultCommissionRate")}%</span>
                </div>
            ),
        },
        {
            accessorKey: "totalReferrals",
            header: "Tổng giới thiệu",
            cell: ({ row }) => (
                <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span>{row.getValue("totalReferrals")}</span>
                </div>
            ),
        },
        {
            accessorKey: "totalCommission",
            header: "Tổng hoa hồng",
            cell: ({ row }) => (
                <div className="font-medium">
                    {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                    }).format(row.getValue("totalCommission"))}
                </div>
            ),
        },
        {
            accessorKey: "createdAt",
            header: "Ngày đăng ký",
            cell: ({ row }) => (
                <div className="text-sm text-muted-foreground">
                    {format(new Date(row.getValue("createdAt")), 'dd/MM/yyyy', { locale: vi })}
                </div>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const affiliate = row.original;
                const actions = [
                    {
                        label: "Xem chi tiết",
                        icon: Eye,
                        onClick: () => handleView(affiliate),
                    },
                    {
                        label: "Chỉnh sửa",
                        icon: Edit,
                        onClick: () => handleEdit(affiliate),
                    },
                ];

                // Add status-specific actions
                if (affiliate.status === 'PENDING') {
                    actions.push(
                        {
                            label: "Phê duyệt",
                            icon: UserCheck,
                            onClick: () => handleApprove(affiliate),
                        },
                        {
                            label: "Từ chối",
                            icon: Trash2,
                            onClick: () => handleReject(affiliate),
                        }
                    );
                } else if (affiliate.status === 'APPROVED') {
                    actions.push(
                        {
                            label: "Tạm ngưng",
                            icon: Trash2,
                            onClick: () => handleSuspend(affiliate),
                        }
                    );
                } else if (affiliate.status === 'SUSPENDED') {
                    actions.push(
                        {
                            label: "Kích hoạt lại",
                            icon: UserCheck,
                            onClick: () => handleReactivate(affiliate),
                        }
                    );
                }

                actions.push({
                    label: "Xóa",
                    icon: Trash2,
                    onClick: () => handleDelete(affiliate),
                });

                return (
                    <DataTableRowActions
                        row={row}
                        actions={actions}
                    />
                );
            },
        },
    ];

    // Calculate stats
    const totalAffiliates = affiliates.length;
    const approvedAffiliates = affiliates.filter(a => a.status === 'APPROVED').length;
    const pendingAffiliates = affiliates.filter(a => a.status === 'PENDING').length;
    const totalCommissions = affiliates.reduce((sum, a) => sum + a.totalCommission, 0);

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng Affiliate</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalAffiliates}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đã phê duyệt</CardTitle>
                        <UserCheck className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{approvedAffiliates}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Chờ phê duyệt</CardTitle>
                        <UserCheck className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{pendingAffiliates}</div>
                    </CardContent>
                </Card>
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
                            }).format(totalCommissions)}
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
                    <option value="PENDING">Chờ phê duyệt</option>
                    <option value="APPROVED">Đã phê duyệt</option>
                    <option value="SUSPENDED">Đã tạm ngưng</option>
                    <option value="REJECTED">Đã từ chối</option>
                </select>
            </div>

            {/* Data Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách Affiliate</CardTitle>
                    <CardDescription>
                        Quản lý các affiliate và hoa hồng của họ
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={affiliates}
                        isLoading={isLoading}
                    />
                </CardContent>
            </Card>

            {/* Add New Button */}
            <div className="flex justify-end">
                <Button onClick={handleAddNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm Affiliate
                </Button>
            </div>
        </div>
    );
};

export default AffiliatesPage; 