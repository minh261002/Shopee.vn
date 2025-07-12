"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/dataTables/data-table'
import { DataTableColumnHeader } from '@/components/dataTables/data-table-column-header'
import { DataTableRowActions } from '@/components/dataTables/data-table-row-actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/axios'
import { Plus, Package, Search, Filter, Download } from 'lucide-react'
import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'

interface ShippingRate {
    id: string
    name: string
    method: string
    basePrice: number
    perKgPrice: number
    estimatedDays: number
    isActive: boolean
    createdAt: string
    provider: {
        id: string
        name: string
        code: string
    }
}

const ShippingRatesPage = () => {
    const router = useRouter()
    const [rates, setRates] = useState<ShippingRate[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    const fetchRates = async () => {
        try {
            setIsLoading(true)
            const response = await api.get('/admin/shipping/rates')
            setRates(response.data)
        } catch (error) {
            console.error('Error fetching rates:', error)
            toast.error('Không thể tải danh sách biểu giá')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchRates()
    }, [])

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/admin/shipping/rates/${id}`)
            toast.success('Xóa biểu giá thành công')
            fetchRates()
        } catch (error) {
            console.error('Error deleting rate:', error)
            toast.error('Có lỗi xảy ra khi xóa biểu giá')
        }
    }

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await api.put(`/admin/shipping/rates/${id}`, {
                isActive: !currentStatus
            })
            toast.success(`Đã ${currentStatus ? 'tắt' : 'bật'} biểu giá`)
            fetchRates()
        } catch (error) {
            console.error('Error toggling rate status:', error)
            toast.error('Có lỗi xảy ra khi cập nhật trạng thái')
        }
    }

    const filteredRates = rates.filter(rate => {
        const matchesSearch = rate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rate.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rate.provider.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && rate.isActive) ||
            (statusFilter === 'inactive' && !rate.isActive)
        return matchesSearch && matchesStatus
    })

    const columns: ColumnDef<ShippingRate>[] = [
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Tên biểu giá" />
            ),
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.name}</div>
                    <div className="text-sm text-muted-foreground">
                        {row.original.method}
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
                        {row.original.provider.code}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'basePrice',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Giá cơ bản" />
            ),
            cell: ({ row }) => (
                <div className="text-right">
                    <div className="font-medium">
                        {row.original.basePrice.toLocaleString('vi-VN')}đ
                    </div>
                    <div className="text-sm text-muted-foreground">
                        +{row.original.perKgPrice.toLocaleString('vi-VN')}đ/kg
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'estimatedDays',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Thời gian" />
            ),
            cell: ({ row }) => (
                <div className="text-center">
                    <Badge variant="outline">
                        {row.original.estimatedDays} ngày
                    </Badge>
                </div>
            ),
        },
        {
            accessorKey: 'isActive',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Trạng thái" />
            ),
            cell: ({ row }) => (
                <Badge variant={row.original.isActive ? "default" : "secondary"}>
                    {row.original.isActive ? "Hoạt động" : "Không hoạt động"}
                </Badge>
            ),
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <DataTableRowActions
                    row={row}
                    actions={[
                        {
                            label: 'Xem chi tiết',
                            onClick: () => router.push(`/admin/shipping/rates/${row.original.id}`),
                        },
                        {
                            label: 'Chỉnh sửa',
                            onClick: () => router.push(`/admin/shipping/rates/${row.original.id}/edit`),
                        },
                        {
                            label: row.original.isActive ? 'Tắt hoạt động' : 'Bật hoạt động',
                            onClick: () => handleToggleStatus(row.original.id, row.original.isActive),
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

    const exportToCSV = () => {
        const headers = ['Tên', 'Phương thức', 'Nhà vận chuyển', 'Giá cơ bản', 'Giá/kg', 'Thời gian', 'Trạng thái']
        const csvData = filteredRates.map(rate => [
            rate.name,
            rate.method,
            rate.provider.name,
            rate.basePrice,
            rate.perKgPrice,
            rate.estimatedDays,
            rate.isActive ? 'Hoạt động' : 'Không hoạt động'
        ])

        const csvContent = [headers, ...csvData]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', 'shipping-rates.csv')
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Biểu giá vận chuyển</h1>
                    <p className="text-muted-foreground">
                        Quản lý biểu giá vận chuyển của các nhà vận chuyển
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/shipping/rates/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm biểu giá
                    </Link>
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng biểu giá</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{rates.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {rates.filter(r => r.isActive).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Nhà vận chuyển</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Set(rates.map(r => r.provider.id)).size}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Giá trung bình</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {rates.length > 0
                                ? Math.round(rates.reduce((sum, r) => sum + r.basePrice, 0) / rates.length).toLocaleString('vi-VN')
                                : 0}đ
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Bộ lọc</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Tìm kiếm theo tên, phương thức, nhà vận chuyển..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border rounded-md text-sm"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="active">Đang hoạt động</option>
                                <option value="inactive">Không hoạt động</option>
                            </select>
                        </div>
                        <Button variant="outline" onClick={exportToCSV}>
                            <Download className="h-4 w-4 mr-2" />
                            Xuất CSV
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Data Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách biểu giá</CardTitle>
                    <CardDescription>
                        {filteredRates.length} biểu giá được tìm thấy
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={filteredRates}
                        isLoading={isLoading}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default ShippingRatesPage 