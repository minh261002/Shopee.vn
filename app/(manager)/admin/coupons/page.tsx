"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Target, Users, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/dataTables/data-table';
import { DataTableRowActions } from '@/components/dataTables/data-table-row-actions';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/axios';
import type { Coupon, CouponsResponse } from '@/types/coupon';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FilterOption } from '@/components/dataTables/data-table-toolbar';

const CouponsPage = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
        type: 'ALL',
        scope: 'ALL',
        status: 'ALL'
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const router = useRouter();

    // Define filters
    const filters: FilterOption[] = [
        {
            key: 'type',
            label: 'Loại coupon',
            type: 'select',
            placeholder: 'Chọn loại coupon',
            options: [
                { value: 'PERCENTAGE', label: 'Phần trăm' },
                { value: 'FIXED_AMOUNT', label: 'Số tiền cố định' },
                { value: 'FREE_SHIPPING', label: 'Miễn phí vận chuyển' },
                { value: 'CASHBACK', label: 'Hoàn tiền' }
            ]
        },
        {
            key: 'scope',
            label: 'Phạm vi',
            type: 'select',
            placeholder: 'Chọn phạm vi',
            options: [
                { value: 'PLATFORM_WIDE', label: 'Toàn platform' },
                { value: 'CATEGORY', label: 'Danh mục' },
                { value: 'BRAND', label: 'Thương hiệu' },
                { value: 'FIRST_ORDER', label: 'Đơn hàng đầu' },
                { value: 'NEW_USER', label: 'User mới' }
            ]
        },
        {
            key: 'status',
            label: 'Trạng thái',
            type: 'select',
            placeholder: 'Chọn trạng thái',
            options: [
                { value: 'ACTIVE', label: 'Đang hoạt động' },
                { value: 'INACTIVE', label: 'Tạm ngưng' },
                { value: 'EXPIRED', label: 'Hết hạn' }
            ]
        }
    ];

    // Fetch coupons
    const fetchCoupons = async (page = 1, type = '', scope = '', status = '') => {
        try {
            setIsLoading(true);
            const params = {
                page: page.toString(),
                limit: '10',
                ...(type && type !== 'ALL' && { type }),
                ...(scope && scope !== 'ALL' && { scope }),
                ...(status && status !== 'ALL' && { status }),
            };

            const response = await api.get('/admin/coupons', { params });
            const data: CouponsResponse = response.data;
            setCoupons(data.coupons);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching coupons:', error);
            toast.error('Lỗi khi tải danh sách coupon');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons(1, activeFilters.type, activeFilters.scope, activeFilters.status);
    }, [activeFilters]);

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
            type: 'ALL',
            scope: 'ALL',
            status: 'ALL'
        });
    };

    // Handle export
    const handleExport = () => {
        toast.info('Tính năng xuất CSV sẽ được thêm sau');
    };

    // Handle refresh
    const handleRefresh = () => {
        fetchCoupons(1, activeFilters.type, activeFilters.scope, activeFilters.status);
    };

    // Handle delete
    const handleDelete = async (coupon: Coupon) => {
        try {
            await api.delete(`/admin/coupons/${coupon.id}`);
            toast.success('Xóa coupon thành công');
            fetchCoupons(1, activeFilters.type, activeFilters.scope, activeFilters.status);
        } catch (error) {
            console.error('Error deleting coupon:', error);
            toast.error('Lỗi khi xóa coupon');
        }
    };

    // Handle edit
    const handleEdit = (coupon: Coupon) => {
        router.push(`/admin/coupons/${coupon.id}/edit`);
    };

    // Handle add new
    const handleAddNew = () => {
        router.push('/admin/coupons/new');
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

    const columns: ColumnDef<Coupon>[] = [
        {
            accessorKey: "code",
            header: "Mã coupon",
            cell: ({ row }) => (
                <div className="font-mono font-medium">
                    {row.getValue("code")}
                </div>
            ),
        },
        {
            accessorKey: "name",
            header: "Tên coupon",
            cell: ({ row }) => (
                <div className="max-w-[200px] truncate">
                    {row.getValue("name")}
                </div>
            ),
        },
        {
            accessorKey: "type",
            header: "Loại",
            cell: ({ row }) => (
                <Badge variant="outline">
                    {getTypeLabel(row.getValue("type"))}
                </Badge>
            ),
        },
        {
            accessorKey: "scope",
            header: "Phạm vi",
            cell: ({ row }) => (
                <Badge variant="outline">
                    {getScopeLabel(row.getValue("scope"))}
                </Badge>
            ),
        },
        {
            accessorKey: "discountValue",
            header: "Giá trị",
            cell: ({ row }) => {
                const type = row.getValue("type") as string;
                const value = row.getValue("discountValue") as number;
                return (
                    <div className="font-medium">
                        {type === 'PERCENTAGE' ? `${value}%` : `${value.toLocaleString()}đ`}
                    </div>
                );
            },
        },
        {
            accessorKey: "usedCount",
            header: "Đã sử dụng",
            cell: ({ row }) => {
                const usedCount = row.getValue("usedCount") as number;
                const totalLimit = row.original.totalLimit;
                return (
                    <div className="text-center">
                        <div className="font-medium">{usedCount}</div>
                        {totalLimit && (
                            <div className="text-xs text-muted-foreground">
                                / {totalLimit}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "startDate",
            header: "Thời gian",
            cell: ({ row }) => {
                const startDate = new Date(row.getValue("startDate"));
                const endDate = new Date(row.original.endDate);
                return (
                    <div className="text-sm">
                        <div>{format(startDate, 'dd/MM/yyyy', { locale: vi })}</div>
                        <div className="text-muted-foreground">
                            {format(endDate, 'dd/MM/yyyy', { locale: vi })}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "isActive",
            header: "Trạng thái",
            cell: ({ row }) => getStatusBadge(row.original),
        },
        {
            id: "actions",
            header: "Thao tác",
            cell: ({ row }) => (
                <DataTableRowActions
                    row={row}
                    actions={[
                        {
                            label: "Xem chi tiết",
                            onClick: (coupon: Coupon) => router.push(`/admin/coupons/${coupon.id}`),
                        },
                        {
                            label: "Chỉnh sửa",
                            onClick: (coupon: Coupon) => handleEdit(coupon),
                        },
                        {
                            label: "Xóa",
                            onClick: (coupon: Coupon) => handleDelete(coupon),
                            variant: "destructive",
                            confirmTitle: "Xác nhận xóa coupon",
                            confirmMessage: "Bạn có chắc chắn muốn xóa coupon này? Hành động này không thể hoàn tác.",
                        },
                    ]}
                />
            ),
        },
    ];

    const activeCoupons = coupons.filter(c => c.isActive && new Date(c.endDate) >= new Date());
    const expiredCoupons = coupons.filter(c => new Date(c.endDate) < new Date());
    const totalUsage = coupons.reduce((sum, c) => sum + c.usedCount, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý Coupon</h1>
                    <p className="text-muted-foreground">
                        Quản lý các mã giảm giá và khuyến mãi
                    </p>
                </div>
                <Button onClick={handleAddNew}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo coupon mới
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng coupon</CardTitle>
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pagination.total}</div>
                        <p className="text-xs text-muted-foreground">
                            Tất cả coupon
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeCoupons.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Coupon đang hoạt động
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đã hết hạn</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{expiredCoupons.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Coupon đã hết hạn
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lượt sử dụng</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsage}</div>
                        <p className="text-xs text-muted-foreground">
                            Tổng lượt sử dụng
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách Coupon</CardTitle>
                    <CardDescription>
                        Quản lý tất cả mã giảm giá và khuyến mãi
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={coupons}
                        searchKey="name"
                        searchPlaceholder="Tìm kiếm coupon..."
                        isLoading={isLoading}
                        emptyMessage="Không có coupon nào."
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

export default CouponsPage; 