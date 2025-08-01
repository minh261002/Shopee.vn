"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/dataTables/data-table'
import { DataTableColumnHeader } from '@/components/dataTables/data-table-column-header'
import { DataTableRowActions } from '@/components/dataTables/data-table-row-actions'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/axios'
import { Plus, Truck, Package } from 'lucide-react'
import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { FilterOption } from '@/components/dataTables/data-table-toolbar'

interface Shipment {
    id: string
    orderId: string
    status: string
    trackingNumber?: string
    shippingFee: number
    createdAt: string
    updatedAt: string
    order: {
        orderNumber: string
        totalAmount: number
        customer: {
            name: string
            email: string
        }
    }
    provider: {
        id: string
        name: string
        code: string
    }
    rate: {
        id: string
        name: string
        method: string
    }
}

const ShipmentsPage = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [shipments, setShipments] = useState<Shipment[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
        status: 'ALL'
    })

    // Define filters
    const filters: FilterOption[] = [
        {
            key: 'status',
            label: 'Trạng thái',
            type: 'select',
            placeholder: 'Chọn trạng thái',
            options: [
                { value: 'pending', label: 'Chờ xử lý' },
                { value: 'processing', label: 'Đang xử lý' },
                { value: 'shipped', label: 'Đã gửi' },
                { value: 'delivered', label: 'Đã giao' },
                { value: 'cancelled', label: 'Đã hủy' },
                { value: 'returned', label: 'Đã trả' }
            ]
        }
    ]

    const fetchShipments = async () => {
        try {
            setIsLoading(true)
            const params = new URLSearchParams()
            if (searchParams.get('providerId')) {
                params.append('providerId', searchParams.get('providerId')!)
            }
            const response = await api.get(`/admin/shipping/shipments?${params.toString()}`)
            setShipments(response.data)
        } catch (error) {
            console.error('Error fetching shipments:', error)
            toast.error('Không thể tải danh sách đơn hàng')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchShipments()
    }, [searchParams])

    // Handle filter change
    const handleFilterChange = (key: string, value: string) => {
        setActiveFilters(prev => ({
            ...prev,
            [key]: value
        }))
    }

    // Handle clear filters
    const handleClearFilters = () => {
        setActiveFilters({
            status: 'ALL'
        })
    }

    // Handle export
    const handleExport = () => {
        const headers = ['Mã đơn hàng', 'Khách hàng', 'Nhà vận chuyển', 'Mã vận đơn', 'Phí vận chuyển', 'Tổng tiền', 'Trạng thái', 'Ngày tạo']
        const csvData = shipments.map(shipment => [
            shipment.order.orderNumber,
            shipment.order.customer.name,
            shipment.provider.name,
            shipment.trackingNumber || '',
            shipment.shippingFee,
            shipment.order.totalAmount,
            shipment.status,
            new Date(shipment.createdAt).toLocaleDateString('vi-VN')
        ])

        const csvContent = [headers, ...csvData]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', 'shipments.csv')
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // Handle refresh
    const handleRefresh = () => {
        fetchShipments()
    }

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/admin/shipping/shipments/${id}`)
            toast.success('Xóa đơn hàng thành công')
            fetchShipments()
        } catch (error) {
            console.error('Error deleting shipment:', error)
            toast.error('Có lỗi xảy ra khi xóa đơn hàng')
        }
    }

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await api.put(`/admin/shipping/shipments/${id}`, { status })
            toast.success('Cập nhật trạng thái thành công')
            fetchShipments()
        } catch (error) {
            console.error('Error updating shipment status:', error)
            toast.error('Có lỗi xảy ra khi cập nhật trạng thái')
        }
    }

    const columns: ColumnDef<Shipment>[] = [
        {
            accessorKey: 'order',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Đơn hàng" />
            ),
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.order.orderNumber}</div>
                    <div className="text-sm text-muted-foreground">
                        {row.original.order.customer.name}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'provider',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Nhà vận chuyển" />
            ),
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.provider.name}</div>
                    <div className="text-sm text-muted-foreground">
                        {row.original.rate.method}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'trackingNumber',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Mã vận đơn" />
            ),
            cell: ({ row }) => (
                <div>
                    {row.original.trackingNumber ? (
                        <Badge variant="outline">{row.original.trackingNumber}</Badge>
                    ) : (
                        <span className="text-muted-foreground">Chưa có</span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'shippingFee',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Phí vận chuyển" />
            ),
            cell: ({ row }) => (
                <div className="text-right">
                    <div className="font-medium">
                        {row.original.shippingFee.toLocaleString('vi-VN')}đ
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Tổng: {row.original.order.totalAmount.toLocaleString('vi-VN')}đ
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Trạng thái" />
            ),
            cell: ({ row }) => {
                const statusColors = {
                    'pending': 'secondary',
                    'processing': 'default',
                    'shipped': 'default',
                    'delivered': 'default',
                    'cancelled': 'destructive',
                    'returned': 'destructive',
                } as const
                return (
                    <Badge variant={statusColors[row.original.status as keyof typeof statusColors] || 'secondary'}>
                        {row.original.status}
                    </Badge>
                )
            },
        },
        {
            accessorKey: 'createdAt',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Ngày tạo" />
            ),
            cell: ({ row }) => (
                <div className="text-sm text-muted-foreground">
                    {new Date(row.original.createdAt).toLocaleDateString('vi-VN')}
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
                            onClick: () => router.push(`/admin/shipping/shipments/${row.original.id}`),
                        },
                        {
                            label: 'Cập nhật trạng thái',
                            onClick: () => {
                                const newStatus = prompt('Nhập trạng thái mới (pending, processing, shipped, delivered, cancelled, returned):')
                                if (newStatus) {
                                    handleUpdateStatus(row.original.id, newStatus)
                                }
                            },
                        },
                        {
                            label: 'Xóa',
                            onClick: () => handleDelete(row.original.id),
                            variant: 'destructive',
                        },
                    ]}
                />
            ),
        },
    ]

    const getStatusStats = () => {
        const stats = {
            total: shipments.length,
            pending: shipments.filter(s => s.status === 'pending').length,
            processing: shipments.filter(s => s.status === 'processing').length,
            shipped: shipments.filter(s => s.status === 'shipped').length,
            delivered: shipments.filter(s => s.status === 'delivered').length,
            cancelled: shipments.filter(s => s.status === 'cancelled').length,
        }
        return stats
    }

    const stats = getStatusStats()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Đơn hàng vận chuyển</h1>
                    <p className="text-muted-foreground">
                        Quản lý đơn hàng vận chuyển của hệ thống
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/shipping/shipments/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Tạo đơn hàng
                    </Link>
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pending}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.processing}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đã gửi</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.shipped}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đã giao</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.delivered}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đã hủy</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.cancelled}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Data Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách đơn hàng</CardTitle>
                    <CardDescription>
                        Quản lý tất cả đơn hàng vận chuyển
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={shipments}
                        searchKey="order"
                        searchPlaceholder="Tìm kiếm đơn hàng..."
                        isLoading={isLoading}
                        emptyMessage="Không có đơn hàng nào."
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
    )
}

export default ShipmentsPage 