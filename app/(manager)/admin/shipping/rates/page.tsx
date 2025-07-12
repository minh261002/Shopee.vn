"use client"

import React, { useState, useEffect } from 'react'
import { DataTable } from '@/components/dataTables/data-table'
import { DataTableRowActions } from '@/components/dataTables/data-table-row-actions'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { api } from '@/lib/axios'
import { Plus, Search, Edit, Trash2, Eye, Settings } from 'lucide-react'
import Link from 'next/link'

interface ShippingRate {
    id: string
    providerId: string
    method: string
    name: string
    fromCity?: string
    toCity?: string
    basePrice: number
    perKgPrice: number
    freeShippingThreshold?: number
    estimatedDays: number
    isActive: boolean
    createdAt: string
    updatedAt: string
    provider: {
        id: string
        name: string
        code: string
    }
}

const ShippingRatesPage = () => {
    const [rates, setRates] = useState<ShippingRate[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const router = useRouter()

    // Fetch rates
    const fetchRates = async () => {
        try {
            setIsLoading(true)
            const response = await api.get('/admin/shipping/rates')
            setRates(response.data.rates || [])
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

    // Handle view
    const handleView = (rate: ShippingRate) => {
        router.push(`/admin/shipping/rates/${rate.id}`)
    }

    // Handle edit
    const handleEdit = (rate: ShippingRate) => {
        router.push(`/admin/shipping/rates/${rate.id}/edit`)
    }

    // Handle delete
    const handleDelete = async (rate: ShippingRate) => {
        try {
            await api.delete(`/admin/shipping/rates/${rate.id}`)
            toast.success('Xóa biểu giá thành công')
            fetchRates()
        } catch (error) {
            console.error('Error deleting rate:', error)
            toast.error('Có lỗi xảy ra khi xóa biểu giá')
        }
    }

    // Handle toggle status
    const handleToggleStatus = async (rate: ShippingRate) => {
        try {
            await api.put(`/admin/shipping/rates/${rate.id}`, {
                isActive: !rate.isActive
            })
            toast.success(`Đã ${rate.isActive ? 'tắt' : 'bật'} biểu giá`)
            fetchRates()
        } catch (error) {
            console.error('Error toggling rate status:', error)
            toast.error('Có lỗi xảy ra khi cập nhật trạng thái')
        }
    }

    const columns: ColumnDef<ShippingRate>[] = [
        {
            accessorKey: "provider.name",
            header: "Nhà vận chuyển",
            cell: ({ row }) => {
                const rate = row.original
                return (
                    <div>
                        <p className="font-medium">{rate.provider.name}</p>
                        <p className="text-sm text-muted-foreground">{rate.provider.code}</p>
                    </div>
                )
            },
        },
        {
            accessorKey: "name",
            header: "Tên biểu giá",
            cell: ({ row }) => {
                const name = row.getValue("name") as string
                return <span className="font-medium">{name}</span>
            },
        },
        {
            accessorKey: "method",
            header: "Phương thức",
            cell: ({ row }) => {
                const method = row.getValue("method") as string
                return <Badge variant="outline">{method}</Badge>
            },
        },
        {
            accessorKey: "basePrice",
            header: "Phí cơ bản",
            cell: ({ row }) => {
                const price = row.getValue("basePrice") as number
                return <span>{price.toLocaleString('vi-VN')}đ</span>
            },
        },
        {
            accessorKey: "perKgPrice",
            header: "Phí/kg",
            cell: ({ row }) => {
                const price = row.getValue("perKgPrice") as number
                return <span>{price.toLocaleString('vi-VN')}đ/kg</span>
            },
        },
        {
            accessorKey: "estimatedDays",
            header: "Thời gian",
            cell: ({ row }) => {
                const days = row.getValue("estimatedDays") as number
                return <span>{days} ngày</span>
            },
        },
        {
            accessorKey: "isActive",
            header: "Trạng thái",
            cell: ({ row }) => {
                const isActive = row.getValue("isActive") as boolean
                return (
                    <Badge variant={isActive ? "default" : "secondary"}>
                        {isActive ? "Hoạt động" : "Không hoạt động"}
                    </Badge>
                )
            },
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DataTableRowActions
                    row={row}
                    actions={[
                        {
                            label: "Xem chi tiết",
                            onClick: handleView,
                            icon: Eye,
                        },
                        {
                            label: "Chỉnh sửa",
                            onClick: handleEdit,
                            icon: Edit,
                        },
                        {
                            label: row.original.isActive ? "Tắt hoạt động" : "Bật hoạt động",
                            onClick: handleToggleStatus,
                            icon: Settings,
                        },
                        {
                            label: "Xóa",
                            onClick: handleDelete,
                            icon: Trash2,
                            variant: "destructive",
                            separator: true,
                            confirmTitle: "Xác nhận xóa biểu giá",
                            confirmMessage: `Bạn có chắc chắn muốn xóa biểu giá "${row.original.name}"? Hành động này không thể hoàn tác.`,
                        },
                    ]}
                />
            ),
        },
    ]

    const filteredRates = rates.filter(rate =>
        rate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rate.provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rate.provider.code.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Quản lý biểu giá vận chuyển</CardTitle>
                            <CardDescription>
                                Tổng cộng {rates.length} biểu giá
                            </CardDescription>
                        </div>
                        <Button asChild>
                            <Link href="/admin/shipping/rates/new">
                                <Plus className="w-4 h-4 mr-2" />
                                Thêm biểu giá
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Search */}
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Tìm kiếm biểu giá..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-600">Tổng biểu giá</p>
                            <p className="text-2xl font-bold text-blue-600">{rates.length}</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-sm font-medium text-green-600">Đang hoạt động</p>
                            <p className="text-2xl font-bold text-green-600">
                                {rates.filter(r => r.isActive).length}
                            </p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg">
                            <p className="text-sm font-medium text-yellow-600">Nhà vận chuyển</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {new Set(rates.map(r => r.providerId)).size}
                            </p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                            <p className="text-sm font-medium text-purple-600">Phí TB</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {rates.length > 0
                                    ? Math.round(rates.reduce((sum, r) => sum + r.basePrice, 0) / rates.length).toLocaleString('vi-VN')
                                    : 0}đ
                            </p>
                        </div>
                    </div>

                    <DataTable
                        columns={columns}
                        data={filteredRates}
                        searchKey="name"
                        searchPlaceholder="Tìm kiếm biểu giá..."
                        isLoading={isLoading}
                        emptyMessage="Không có biểu giá nào."
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default ShippingRatesPage 