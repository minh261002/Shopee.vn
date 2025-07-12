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

const StoresPage = () => {
    const [stores, setStores] = useState<StoreData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('ALL')
    const [typeFilter, setTypeFilter] = useState<string>('ALL')
    const [verificationFilter, setVerificationFilter] = useState<string>('ALL')
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    })
    const router = useRouter()

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
        fetchStores(1, searchTerm, statusFilter, typeFilter, verificationFilter)
    }, [searchTerm, statusFilter, typeFilter, verificationFilter])

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
                                        'outline'
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
                <CardContent className="space-y-4">
                    {/* Filters */}
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <input
                                type="text"
                                placeholder="Tìm kiếm cửa hàng..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="ALL">Tất cả trạng thái</option>
                                <option value="ACTIVE">Hoạt động</option>
                                <option value="PENDING_APPROVAL">Chờ duyệt</option>
                                <option value="SUSPENDED">Tạm khóa</option>
                                <option value="CLOSED">Đã đóng</option>
                                <option value="BANNED">Cấm hoạt động</option>
                            </select>

                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="ALL">Tất cả loại hình</option>
                                <option value="INDIVIDUAL">Cá nhân</option>
                                <option value="BUSINESS">Doanh nghiệp</option>
                                <option value="CORPORATION">Tập đoàn</option>
                                <option value="OFFICIAL">Chính thức</option>
                            </select>

                            <select
                                value={verificationFilter}
                                onChange={(e) => setVerificationFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="ALL">Tất cả xác thực</option>
                                <option value="PENDING">Chờ xác thực</option>
                                <option value="VERIFIED">Đã xác thực</option>
                                <option value="REJECTED">Từ chối</option>
                                <option value="EXPIRED">Hết hạn</option>
                            </select>
                        </div>
                    </div>

                    <DataTable
                        columns={columns}
                        data={stores}
                        searchKey="name"
                        searchPlaceholder="Tìm kiếm cửa hàng..."
                        isLoading={isLoading}
                        emptyMessage="Không có cửa hàng nào."
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default StoresPage 