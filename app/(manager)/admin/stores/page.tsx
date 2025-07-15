"use client"

import React, { useState, useEffect } from 'react'
import { DataTable } from '@/components/dataTables/data-table'
import { DataTableRowActions } from '@/components/dataTables/data-table-row-actions'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'
import { api } from '@/lib/axios'
import type { StoreData } from '@/types/store'
import { Store, Eye, Edit, Trash2 } from 'lucide-react'
import { FilterOption } from '@/components/dataTables/data-table-toolbar'

const StoresPage = () => {
    const [stores, setStores] = useState<StoreData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
        status: 'ALL',
        type: 'ALL',
        verification: 'ALL'
    })
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
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
                { value: 'ACTIVE', label: 'Hoạt động' },
                { value: 'PENDING_APPROVAL', label: 'Chờ duyệt' },
                { value: 'SUSPENDED', label: 'Tạm khóa' },
                { value: 'CLOSED', label: 'Đã đóng' }
            ]
        },
        {
            key: 'type',
            label: 'Loại hình',
            type: 'select',
            placeholder: 'Chọn loại hình',
            options: [
                { value: 'INDIVIDUAL', label: 'Cá nhân' },
                { value: 'BUSINESS', label: 'Doanh nghiệp' },
                { value: 'CORPORATION', label: 'Tập đoàn' },
                { value: 'OFFICIAL', label: 'Chính thức' }
            ]
        },
        {
            key: 'verification',
            label: 'Xác thực',
            type: 'select',
            placeholder: 'Chọn trạng thái xác thực',
            options: [
                { value: 'PENDING', label: 'Chờ xác thực' },
                { value: 'VERIFIED', label: 'Đã xác thực' },
                { value: 'REJECTED', label: 'Từ chối' },
                { value: 'EXPIRED', label: 'Hết hạn' }
            ]
        }
    ]

    // Fetch stores
    const fetchStores = async (page = 1, search = '', status = '', type = '', verification = '') => {
        try {
            setIsLoading(true)
            const params = {
                page: page.toString(),
                limit: '10',
                ...(search && { search }),
                ...(status !== 'ALL' && { status }),
                ...(type !== 'ALL' && { type }),
                ...(verification !== 'ALL' && { verificationStatus: verification }),
            }

            const response = await api.get('/admin/stores', { params })
            const data = response.data
            setStores(data.stores)
            setPagination(data.pagination)
        } catch (error) {
            console.error('Error fetching stores:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchStores(
            1,
            searchTerm,
            activeFilters.status,
            activeFilters.type,
            activeFilters.verification
        )
    }, [searchTerm, activeFilters])

    // Handle search change
    const handleSearchChange = (value: string) => {
        setSearchTerm(value)
    }

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
            status: 'ALL',
            type: 'ALL',
            verification: 'ALL'
        })
    }

    // Handle export
    const handleExport = () => {
        toast.info('Tính năng xuất dữ liệu đang được phát triển')
    }

    // Handle refresh
    const handleRefresh = () => {
        fetchStores(
            1,
            searchTerm,
            activeFilters.status,
            activeFilters.type,
            activeFilters.verification
        )
    }

    // Handle view
    const handleView = (store: StoreData) => {
        router.push(`/admin/stores/${store.id}`)
    }

    // Handle edit
    const handleEdit = (store: StoreData) => {
        router.push(`/admin/stores/${store.id}/edit`)
    }

    // Handle delete
    const handleDelete = async (store: StoreData) => {
        try {
            await api.delete(`/admin/stores/${store.id}`)
            toast.success('Xóa cửa hàng thành công')
            fetchStores()
        } catch (error) {
            console.error('Error deleting store:', error)
        }
    }

    const columns: ColumnDef<StoreData>[] = [
        {
            accessorKey: "name",
            header: "Tên cửa hàng",
            cell: ({ row }) => {
                const store = row.original
                return (
                    <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden">
                            {store.logo ? (
                                <Image
                                    src={store.logo}
                                    alt={store.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <Store className="w-4 h-4" />
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-medium">{store.name}</p>
                            <p className="text-xs text-muted-foreground">{store.email}</p>
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: "type",
            header: "Loại hình",
            cell: ({ row }) => {
                const type = row.getValue("type") as string
                return <Badge variant="outline">{type}</Badge>
            },
        },
        {
            accessorKey: "status",
            header: "Trạng thái",
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                return (
                    <Badge
                        variant={
                            status === 'ACTIVE' ? 'default' :
                                status === 'PENDING_APPROVAL' ? 'secondary' :
                                    status === 'SUSPENDED' ? 'destructive' :
                                        status === 'CLOSED' ? 'outline' :
                                            'secondary'
                        }
                    >
                        {status}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "verificationStatus",
            header: "Xác thực",
            cell: ({ row }) => {
                const status = row.getValue("verificationStatus") as string
                return (
                    <Badge
                        variant={
                            status === 'VERIFIED' ? 'default' :
                                status === 'PENDING' ? 'secondary' :
                                    status === 'REJECTED' ? 'destructive' :
                                        'outline'
                        }
                    >
                        {status}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "totalProducts",
            header: "Sản phẩm",
            cell: ({ row }) => {
                const total = row.getValue("totalProducts") as number
                return <span>{total.toLocaleString('vi-VN')}</span>
            },
        },
        {
            accessorKey: "totalOrders",
            header: "Đơn hàng",
            cell: ({ row }) => {
                const total = row.getValue("totalOrders") as number
                return <span>{total.toLocaleString('vi-VN')}</span>
            },
        },
        {
            accessorKey: "totalRevenue",
            header: "Doanh thu",
            cell: ({ row }) => {
                const total = row.getValue("totalRevenue") as number
                return <span>{total.toLocaleString('vi-VN')}đ</span>
            },
        },
        {
            accessorKey: "rating",
            header: "Đánh giá",
            cell: ({ row }) => {
                const rating = row.getValue("rating") as number
                const reviewCount = row.original.reviewCount
                return (
                    <span>
                        {rating.toFixed(1)}/5 ({reviewCount} đánh giá)
                    </span>
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
                            label: "Xóa",
                            onClick: handleDelete,
                            icon: Trash2,
                            variant: "destructive",
                            separator: true,
                            confirmTitle: "Xác nhận xóa cửa hàng",
                            confirmMessage: `Bạn có chắc chắn muốn xóa cửa hàng "${row.original.name}"? Hành động này không thể hoàn tác.`,
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
                    <CardTitle>Danh sách cửa hàng</CardTitle>
                    <CardDescription>
                        Tổng cộng {pagination.total} cửa hàng
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={stores}
                        searchKey="name"
                        searchPlaceholder="Tìm kiếm cửa hàng..."
                        isLoading={isLoading}
                        emptyMessage="Không có cửa hàng nào."
                        filters={filters}
                        activeFilters={activeFilters}
                        onFilterChange={handleFilterChange}
                        onClearFilters={handleClearFilters}
                        onSearchChange={handleSearchChange}
                        onExport={handleExport}
                        onRefresh={handleRefresh}
                        showToolbar={true}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default StoresPage 