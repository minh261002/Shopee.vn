"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Clock, Target, Zap, Eye, Edit, Package, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/dataTables/data-table';
import { DataTableRowActions } from '@/components/dataTables/data-table-row-actions';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/axios';
import type { FlashSale, FlashSalesResponse } from '@/types/flash-sale';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FilterOption } from '@/components/dataTables/data-table-toolbar';

const FlashSalesPage = () => {
    const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
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
            key: 'status',
            label: 'Trạng thái',
            type: 'select',
            placeholder: 'Chọn trạng thái',
            options: [
                { value: 'UPCOMING', label: 'Sắp diễn ra' },
                { value: 'ACTIVE', label: 'Đang diễn ra' },
                { value: 'ENDED', label: 'Đã kết thúc' },
                { value: 'CANCELLED', label: 'Đã hủy' }
            ]
        }
    ];

    // Fetch flash sales
    const fetchFlashSales = async (page = 1, status = '') => {
        try {
            setIsLoading(true);
            const params = {
                page: page.toString(),
                limit: '10',
                ...(status && status !== 'ALL' && { status }),
            };

            const response = await api.get('/admin/flash-sales', { params });
            const data: FlashSalesResponse = response.data;
            setFlashSales(data.flashSales);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching flash sales:', error);
            toast.error('Lỗi khi tải danh sách chương trình khuyến mãi');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFlashSales(1, activeFilters.status);
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
            status: 'ALL'
        });
    };

    // Handle export
    const handleExport = () => {
        toast.info('Tính năng xuất CSV sẽ được thêm sau');
    };

    // Handle refresh
    const handleRefresh = () => {
        fetchFlashSales(1, activeFilters.status);
    };

    // Handle delete
    const handleDelete = async (flashSale: FlashSale) => {
        try {
            await api.delete(`/admin/flash-sales/${flashSale.id}`);
            toast.success('Xóa chương trình khuyến mãi thành công');
            fetchFlashSales(1, activeFilters.status);
        } catch (error) {
            console.error('Error deleting flash sale:', error);
            toast.error('Lỗi khi xóa chương trình khuyến mãi');
        }
    };

    // Handle edit
    const handleEdit = (flashSale: FlashSale) => {
        router.push(`/admin/flash-sales/${flashSale.id}/edit`);
    };

    // Handle add new
    const handleAddNew = () => {
        router.push('/admin/flash-sales/new');
    };

    const getStatusBadge = (flashSale: FlashSale) => {
        const now = new Date();
        const startTime = new Date(flashSale.startTime);
        const endTime = new Date(flashSale.endTime);

        if (flashSale.status === 'CANCELLED') {
            return <Badge variant="destructive">Đã hủy</Badge>;
        }

        if (now < startTime) {
            return <Badge variant="secondary">Sắp diễn ra</Badge>;
        }

        if (now >= startTime && now <= endTime) {
            return <Badge variant="default">Đang diễn ra</Badge>;
        }

        return <Badge variant="destructive">Đã kết thúc</Badge>;
    };

    const getProgressPercentage = (flashSale: FlashSale) => {
        const now = new Date();
        const startTime = new Date(flashSale.startTime);
        const endTime = new Date(flashSale.endTime);
        const totalDuration = endTime.getTime() - startTime.getTime();
        const elapsed = now.getTime() - startTime.getTime();

        if (now < startTime) return 0;
        if (now > endTime) return 100;

        return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    };

    const getTimeRemaining = (flashSale: FlashSale) => {
        const now = new Date();
        const startTime = new Date(flashSale.startTime);
        const endTime = new Date(flashSale.endTime);

        if (now < startTime) {
            const diff = startTime.getTime() - now.getTime();
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            return `${days}d ${hours}h ${minutes}m`;
        }

        if (now > endTime) {
            return 'Đã kết thúc';
        }

        const diff = endTime.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${days}d ${hours}h ${minutes}m`;
    };

    const columns: ColumnDef<FlashSale>[] = [
        {
            accessorKey: "name",
            header: "Tên flash sale",
            cell: ({ row }) => (
                <div className="max-w-[200px]">
                    <div className="font-medium truncate">{row.getValue("name")}</div>
                    {row.original.description && (
                        <div className="text-xs text-muted-foreground truncate">
                            {row.original.description}
                        </div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Trạng thái",
            cell: ({ row }) => getStatusBadge(row.original),
        },
        {
            accessorKey: "startTime",
            header: "Thời gian",
            cell: ({ row }) => {
                const startTime = new Date(row.getValue("startTime"));
                const endTime = new Date(row.original.endTime);
                const timeRemaining = getTimeRemaining(row.original);
                return (
                    <div className="text-sm">
                        <div>{format(startTime, 'dd/MM/yyyy HH:mm', { locale: vi })}</div>
                        <div className="text-muted-foreground">
                            {format(endTime, 'dd/MM/yyyy HH:mm', { locale: vi })}
                        </div>
                        <div className="text-xs text-blue-600 font-medium">
                            {timeRemaining}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "flashSaleItems",
            header: "Sản phẩm",
            cell: ({ row }) => {
                const items = row.original.flashSaleItems || [];
                return (
                    <div className="text-center">
                        <div className="font-medium">{items.length}</div>
                        <div className="text-xs text-muted-foreground">
                            sản phẩm
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "maxQuantityPerUser",
            header: "Giới hạn",
            cell: ({ row }) => {
                const maxQuantity = row.original.maxQuantityPerUser;
                return (
                    <div className="text-center">
                        {maxQuantity ? (
                            <div className="font-medium">{maxQuantity}</div>
                        ) : (
                            <div className="text-muted-foreground">Không giới hạn</div>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "minOrderAmount",
            header: "Đơn tối thiểu",
            cell: ({ row }) => {
                const minAmount = row.original.minOrderAmount;
                return (
                    <div className="text-center">
                        {minAmount ? (
                            <div className="font-medium">{minAmount.toLocaleString()}đ</div>
                        ) : (
                            <div className="text-muted-foreground">Không yêu cầu</div>
                        )}
                    </div>
                );
            },
        },
        {
            id: "progress",
            header: "Tiến độ",
            cell: ({ row }) => {
                const progress = getProgressPercentage(row.original);
                const now = new Date();
                const startTime = new Date(row.original.startTime);
                const endTime = new Date(row.original.endTime);

                if (now < startTime) {
                    return (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-gray-400 h-2 rounded-full" style={{ width: '0%' }}></div>
                        </div>
                    );
                }

                if (now > endTime) {
                    return (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                    );
                }

                return (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                );
            },
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
                            icon: Eye,
                            onClick: (flashSale: FlashSale) => router.push(`/admin/flash-sales/${flashSale.id}`),
                        },
                        {
                            label: "Chỉnh sửa",
                            icon: Edit,
                            onClick: (flashSale: FlashSale) => handleEdit(flashSale),
                        },
                        {
                            label: "Quản lý sản phẩm",
                            icon: Package,
                            onClick: (flashSale: FlashSale) => router.push(`/admin/flash-sales/${flashSale.id}/items`),
                        },
                        {
                            label: "Xóa",
                            icon: Trash2,
                            onClick: (flashSale: FlashSale) => handleDelete(flashSale),
                            variant: "destructive",
                            confirmTitle: "Xác nhận xóa flash sale",
                            confirmMessage: "Bạn có chắc chắn muốn xóa flash sale này? Hành động này không thể hoàn tác.",
                        },
                    ]}
                />
            ),
        },
    ];

    const activeFlashSales = flashSales.filter(fs => fs.status === 'ACTIVE');
    const upcomingFlashSales = flashSales.filter(fs => fs.status === 'UPCOMING');
    const totalItems = flashSales.reduce((sum, fs) => sum + (fs.flashSaleItems?.length || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý Chương trình khuyến mãi</h1>
                    <p className="text-muted-foreground">
                        Quản lý các chương trình khuyến mãi
                    </p>
                </div>
                <Button onClick={handleAddNew}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo chương trình khuyến mãi mới
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng chương trình khuyến mãi</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pagination.total}</div>
                        <p className="text-xs text-muted-foreground">
                            Tất cả chương trình khuyến mãi
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đang diễn ra</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeFlashSales.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Chương trình khuyến mãi đang hoạt động
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sắp diễn ra</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{upcomingFlashSales.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Chương trình khuyến mãi sắp bắt đầu
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalItems}</div>
                        <p className="text-xs text-muted-foreground">
                            Sản phẩm trong chương trình khuyến mãi
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách Chương trình khuyến mãi</CardTitle>
                    <CardDescription>
                        Quản lý tất cả chương trình khuyến mãi
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={flashSales}
                        searchKey="name"
                        searchPlaceholder="Tìm kiếm chương trình khuyến mãi..."
                        isLoading={isLoading}
                        emptyMessage="Không có chương trình khuyến mãi nào."
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

export default FlashSalesPage; 