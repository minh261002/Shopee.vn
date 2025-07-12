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
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'

interface Shipment {
    id: string
    orderId: string
    providerId: string
    method: string
    status: string
    trackingNumber?: string
    providerOrderId?: string
    pickupAddress: string
    deliveryAddress: string
    weight?: number
    shippingFee: number
    totalFee: number
    createdAt: string
    updatedAt: string
    provider: {
        id: string
        name: string
        code: string
    }
    order: {
        id: string
        orderNumber: string
        totalAmount: number
        status: string
    }
}

const ShipmentsPage = () => {
    const [shipments, setShipments] = useState<Shipment[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const router = useRouter()

    // Fetch shipments
    const fetchShipments = async () => {
        try {
            setIsLoading(true)
            const response = await api.get('/admin/shipping/shipments')
            setShipments(response.data.shipments || [])
        } catch (error) {
            console.error('Error fetching shipments:', error)
            toast.error('Không thể tải danh sách đơn hàng vận chuyển')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchShipments()
    }, [])

    // Handle view
    const handleView = (shipment: Shipment) => {
        router.push(`/admin/shipping/shipments/${shipment.id}`)
    }

    // Handle edit
    const handleEdit = (shipment: Shipment) => {
        router.push(`/admin/shipping/shipments/${shipment.id}/edit`)
    }

    // Handle delete
    const handleDelete = async (shipment: Shipment) => {
        try {
            await api.delete(`/admin/shipping/shipments/${shipment.id}`)
            toast.success('Xóa đơn hàng vận chuyển thành công')
            fetchShipments()
        } catch (error) {
            console.error('Error deleting shipment:', error)
            toast.error('Có lỗi xảy ra khi xóa đơn hàng vận chuyển')
        }
    }

    // Get status badge variant
    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
            'PENDING': { variant: 'secondary', label: 'Chờ xử lý' },
            'CONFIRMED': { variant: 'outline', label: 'Đã xác nhận' },
            'PICKED_UP': { variant: 'default', label: 'Đã lấy hàng' },
            'IN_TRANSIT': { variant: 'default', label: 'Đang vận chuyển' },
            'OUT_FOR_DELIVERY': { variant: 'default', label: 'Đang giao hàng' },
            'DELIVERED': { variant: 'default', label: 'Đã giao hàng' },
            'FAILED_DELIVERY': { variant: 'destructive', label: 'Giao hàng thất bại' },
            'RETURNED_TO_SENDER': { variant: 'destructive', label: 'Đã trả về' },
        }
        return statusMap[status] || { variant: 'secondary', label: status }
    }

    const columns: ColumnDef<Shipment>[] = [
        {
            accessorKey: "order.orderNumber",
            header: "Mã đơn hàng",
            cell: ({ row }) => {
                const orderNumber = row.original.order.orderNumber
                return (
                    <div>
                        <p className="font-medium">{orderNumber}</p>
                        <p className="text-sm text-muted-foreground">#{row.original.orderId}</p>
                    </div>
                )
            },
        },
        {
            accessorKey: "provider.name",
            header: "Nhà vận chuyển",
            cell: ({ row }) => {
                const shipment = row.original
                return (
                    <div>
                        <p className="font-medium">{shipment.provider.name}</p>
                        <p className="text-sm text-muted-foreground">{shipment.provider.code}</p>
                    </div>
                )
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
            accessorKey: "status",
            header: "Trạng thái",
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                const { variant, label } = getStatusBadge(status)
                return <Badge variant={variant}>{label}</Badge>
            },
        },
        {
            accessorKey: "trackingNumber",
            header: "Mã vận đơn",
            cell: ({ row }) => {
                const trackingNumber = row.getValue("trackingNumber") as string
                return trackingNumber ? (
                    <span className="font-mono text-sm">{trackingNumber}</span>
                ) : (
                    <span className="text-muted-foreground text-sm">Chưa có</span>
                )
            },
        },
        {
            accessorKey: "shippingFee",
            header: "Phí vận chuyển",
            cell: ({ row }) => {
                const fee = row.getValue("shippingFee") as number
                return <span>{fee.toLocaleString('vi-VN')}đ</span>
            },
        },
        {
            accessorKey: "weight",
            header: "Cân nặng",
            cell: ({ row }) => {
                const weight = row.getValue("weight") as number
                return weight ? <span>{weight}kg</span> : <span className="text-muted-foreground">-</span>
            },
        },
        {
            accessorKey: "createdAt",
            header: "Ngày tạo",
            cell: ({ row }) => {
                const date = new Date(row.getValue("createdAt") as string)
                return <span>{date.toLocaleDateString('vi-VN')}</span>
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
                            confirmTitle: "Xác nhận xóa đơn hàng vận chuyển",
                            confirmMessage: `Bạn có chắc chắn muốn xóa đơn hàng vận chuyển này? Hành động này không thể hoàn tác.`,
                        },
                    ]}
                />
            ),
        },
    ]

    const filteredShipments = shipments.filter(shipment =>
        shipment.order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Calculate stats
    const totalShipments = shipments.length
    const deliveredShipments = shipments.filter(s => s.status === 'DELIVERED').length
    const inTransitShipments = shipments.filter(s => ['IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(s.status)).length
    const totalRevenue = shipments.reduce((sum, s) => sum + s.shippingFee, 0)

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Quản lý đơn hàng vận chuyển</CardTitle>
                            <CardDescription>
                                Tổng cộng {totalShipments} đơn hàng vận chuyển
                            </CardDescription>
                        </div>
                        <Button asChild>
                            <Link href="/admin/shipping/shipments/new">
                                <Plus className="w-4 h-4 mr-2" />
                                Tạo đơn vận chuyển
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
                                placeholder="Tìm kiếm đơn hàng..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-600">Tổng đơn hàng</p>
                            <p className="text-2xl font-bold text-blue-600">{totalShipments}</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-sm font-medium text-green-600">Đã giao hàng</p>
                            <p className="text-2xl font-bold text-green-600">{deliveredShipments}</p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg">
                            <p className="text-sm font-medium text-yellow-600">Đang vận chuyển</p>
                            <p className="text-2xl font-bold text-yellow-600">{inTransitShipments}</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                            <p className="text-sm font-medium text-purple-600">Doanh thu</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {totalRevenue.toLocaleString('vi-VN')}đ
                            </p>
                        </div>
                    </div>

                    <DataTable
                        columns={columns}
                        data={filteredShipments}
                        searchPlaceholder="Tìm kiếm đơn hàng..."
                        isLoading={isLoading}
                        emptyMessage="Không có đơn hàng vận chuyển nào."
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default ShipmentsPage 