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
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    })
    const router = useRouter()

    // Fetch stores
    const fetchStores = async (page = 1, search = '') => {
        try {
            setIsLoading(true)
            const params = {
                page: page.toString(),
                limit: '10',
                ...(search && { search }),
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
        fetchStores()
    }, [])

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
                <CardContent>
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