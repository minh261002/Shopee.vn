"use client"

import React, { useState, useEffect } from 'react'
import { DataTable } from '@/components/dataTables/data-table'
import { DataTableRowActions } from '@/components/dataTables/data-table-row-actions'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'
import { api } from '@/lib/axios'
import { Truck, Plus, Edit, Trash2, Eye, Settings } from 'lucide-react'
import Link from 'next/link'
import { FilterOption } from '@/components/dataTables/data-table-toolbar'

interface ShippingProvider {
    id: string
    name: string
    code: string
    description?: string
    logo?: string
    website?: string
    isActive: boolean
    createdAt: string
    updatedAt: string
    _count: {
        shippingRates: number
        shipments: number
    }
}

const ShippingProvidersPage = () => {
    const [providers, setProviders] = useState<ShippingProvider[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
        status: 'ALL'
    })
    const router = useRouter()

    // Define filters
    const filters: FilterOption[] = [
        {
            key: 'status',
            label: 'Trạng thái',
            type: 'select',
            placeholder: 'Chọn trạng thái',
            options: [
                { value: 'ACTIVE', label: 'Đang hoạt động' },
                { value: 'INACTIVE', label: 'Không hoạt động' }
            ]
        }
    ]

    // Fetch providers
    const fetchProviders = async () => {
        try {
            setIsLoading(true)
            const response = await api.get('/admin/shipping/providers')
            setProviders(response.data.providers || [])
        } catch (error) {
            console.error('Error fetching providers:', error)
            toast.error('Không thể tải danh sách nhà vận chuyển')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchProviders()
    }, [])

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
        toast.info('Tính năng xuất dữ liệu đang được phát triển')
    }

    // Handle refresh
    const handleRefresh = () => {
        fetchProviders()
    }

    // Handle view
    const handleView = (provider: ShippingProvider) => {
        router.push(`/admin/shipping/providers/${provider.id}`)
    }

    // Handle edit
    const handleEdit = (provider: ShippingProvider) => {
        router.push(`/admin/shipping/providers/${provider.id}/edit`)
    }

    // Handle delete
    const handleDelete = async (provider: ShippingProvider) => {
        try {
            await api.delete(`/admin/shipping/providers/${provider.id}`)
            toast.success('Xóa nhà vận chuyển thành công')
            fetchProviders()
        } catch (error) {
            console.error('Error deleting provider:', error)
            toast.error('Có lỗi xảy ra khi xóa nhà vận chuyển')
        }
    }

    // Handle toggle status
    const handleToggleStatus = async (provider: ShippingProvider) => {
        try {
            await api.put(`/admin/shipping/providers/${provider.id}`, {
                isActive: !provider.isActive
            })
            toast.success(`Đã ${provider.isActive ? 'tắt' : 'bật'} nhà vận chuyển`)
            fetchProviders()
        } catch (error) {
            console.error('Error toggling provider status:', error)
            toast.error('Có lỗi xảy ra khi cập nhật trạng thái')
        }
    }

    const columns: ColumnDef<ShippingProvider>[] = [
        {
            accessorKey: "name",
            header: "Nhà vận chuyển",
            cell: ({ row }) => {
                const provider = row.original
                return (
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted">
                            {provider.logo ? (
                                <Image
                                    src={provider.logo}
                                    alt={provider.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Truck className="w-5 h-5 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-medium">{provider.name}</p>
                            <p className="text-sm text-muted-foreground">Code: {provider.code}</p>
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: "description",
            header: "Mô tả",
            cell: ({ row }) => {
                const description = row.getValue("description") as string
                return (
                    <p className="text-sm text-muted-foreground max-w-xs truncate">
                        {description || 'Chưa có mô tả'}
                    </p>
                )
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
            accessorKey: "_count.shippingRates",
            header: "Biểu giá",
            cell: ({ row }) => {
                const count = row.original._count.shippingRates
                return <span>{count} biểu giá</span>
            },
        },
        {
            accessorKey: "_count.shipments",
            header: "Đơn hàng",
            cell: ({ row }) => {
                const count = row.original._count.shipments
                return <span>{count} đơn hàng</span>
            },
        },
        {
            accessorKey: "website",
            header: "Website",
            cell: ({ row }) => {
                const website = row.getValue("website") as string
                return website ? (
                    <a
                        href={website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                    >
                        Xem website
                    </a>
                ) : (
                    <span className="text-muted-foreground text-sm">Chưa có</span>
                )
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
                            confirmTitle: "Xác nhận xóa nhà vận chuyển",
                            confirmMessage: `Bạn có chắc chắn muốn xóa nhà vận chuyển "${row.original.name}"? Hành động này không thể hoàn tác.`,
                        },
                    ]}
                />
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Quản lý nhà vận chuyển</CardTitle>
                            <CardDescription>
                                Tổng cộng {providers.length} nhà vận chuyển
                            </CardDescription>
                        </div>
                        <Button asChild>
                            <Link href="/admin/shipping/providers/new">
                                <Plus className="w-4 h-4 mr-2" />
                                Thêm nhà vận chuyển
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-600">Tổng nhà vận chuyển</p>
                            <p className="text-2xl font-bold text-blue-600">{providers.length}</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-sm font-medium text-green-600">Đang hoạt động</p>
                            <p className="text-2xl font-bold text-green-600">
                                {providers.filter(p => p.isActive).length}
                            </p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg">
                            <p className="text-sm font-medium text-yellow-600">Tổng biểu giá</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {providers.reduce((sum, p) => sum + p._count.shippingRates, 0)}
                            </p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                            <p className="text-sm font-medium text-purple-600">Tổng đơn hàng</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {providers.reduce((sum, p) => sum + p._count.shipments, 0)}
                            </p>
                        </div>
                    </div>

                    <DataTable
                        columns={columns}
                        data={providers}
                        searchKey="name"
                        searchPlaceholder="Tìm kiếm nhà vận chuyển..."
                        isLoading={isLoading}
                        emptyMessage="Không có nhà vận chuyển nào."
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

export default ShippingProvidersPage 