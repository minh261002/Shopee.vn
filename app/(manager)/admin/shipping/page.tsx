"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { api } from '@/lib/axios'
import {
    Truck,
    Package,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle,
    XCircle,
    Plus,
    BarChart3
} from 'lucide-react'
import Link from 'next/link'

interface ShippingStats {
    totalProviders: number
    activeProviders: number
    totalRates: number
    activeRates: number
    totalShipments: number
    pendingShipments: number
    processingShipments: number
    shippedShipments: number
    deliveredShipments: number
    cancelledShipments: number
    totalRevenue: number
    monthlyRevenue: number
    revenueChange: number
}

interface RecentShipment {
    id: string
    order: {
        orderNumber: string
        totalAmount: number
    }
    provider: {
        name: string
    }
    status: string
    shippingFee: number
    createdAt: string
}

interface TopProvider {
    id: string
    name: string
    code: string
    shipmentCount: number
    revenue: number
}

const ShippingDashboardPage = () => {
    const [stats, setStats] = useState<ShippingStats | null>(null)
    const [recentShipments, setRecentShipments] = useState<RecentShipment[]>([])
    const [topProviders, setTopProviders] = useState<TopProvider[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true)
            const [statsRes, shipmentsRes, providersRes] = await Promise.all([
                api.get('/admin/shipping/stats'),
                api.get('/admin/shipping/shipments?limit=5'),
                api.get('/admin/shipping/providers/top')
            ])

            setStats(statsRes.data)
            setRecentShipments(shipmentsRes.data)
            setTopProviders(providersRes.data)
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
            toast.error('Không thể tải dữ liệu dashboard')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'delivered':
                return <CheckCircle className="h-4 w-4 text-green-500" />
            case 'cancelled':
                return <XCircle className="h-4 w-4 text-red-500" />
            case 'pending':
            case 'processing':
                return <Clock className="h-4 w-4 text-yellow-500" />
            default:
                return <Package className="h-4 w-4 text-blue-500" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'bg-green-100 text-green-800'
            case 'cancelled':
                return 'bg-red-100 text-red-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'processing':
                return 'bg-blue-100 text-blue-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 bg-muted rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Vận chuyển</h1>
                    <p className="text-muted-foreground">
                        Tổng quan hệ thống vận chuyển
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild>
                        <Link href="/admin/shipping/providers/new">
                            <Plus className="w-4 h-4 mr-2" />
                            Thêm nhà vận chuyển
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/admin/shipping/rates/new">
                            <Package className="w-4 h-4 mr-2" />
                            Thêm biểu giá
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Nhà vận chuyển</CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalProviders || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.activeProviders || 0} đang hoạt động
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Biểu giá</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalRates || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.activeRates || 0} đang hoạt động
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đơn hàng</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalShipments || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.deliveredShipments || 0} đã giao
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {(stats?.totalRevenue || 0).toLocaleString('vi-VN')}đ
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                            {stats?.revenueChange && stats.revenueChange > 0 ? (
                                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                            ) : (
                                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                            )}
                            {Math.abs(stats?.revenueChange || 0)}% so với tháng trước
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {stats?.pendingShipments || 0}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {stats?.processingShipments || 0}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Đã gửi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                            {stats?.shippedShipments || 0}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Đã giao</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {stats?.deliveredShipments || 0}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Đã hủy</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {stats?.cancelledShipments || 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity & Top Providers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Shipments */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Đơn hàng gần đây</CardTitle>
                                <CardDescription>
                                    {recentShipments.length} đơn hàng mới nhất
                                </CardDescription>
                            </div>
                            <Button asChild size="sm">
                                <Link href="/admin/shipping/shipments">
                                    Xem tất cả
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentShipments.map((shipment) => (
                                <div key={shipment.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        {getStatusIcon(shipment.status)}
                                        <div>
                                            <p className="font-medium">{shipment.order.orderNumber}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {shipment.provider.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">
                                            {shipment.shippingFee.toLocaleString('vi-VN')}đ
                                        </p>
                                        <Badge className={getStatusColor(shipment.status)}>
                                            {shipment.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                            {recentShipments.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">
                                    Chưa có đơn hàng nào
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Providers */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Nhà vận chuyển hàng đầu</CardTitle>
                                <CardDescription>
                                    Theo số lượng đơn hàng và doanh thu
                                </CardDescription>
                            </div>
                            <Button asChild size="sm">
                                <Link href="/admin/shipping/providers">
                                    Xem tất cả
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topProviders.map((provider, index) => (
                                <div key={provider.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-medium">{index + 1}</span>
                                        </div>
                                        <div>
                                            <p className="font-medium">{provider.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {provider.shipmentCount} đơn hàng
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">
                                            {provider.revenue.toLocaleString('vi-VN')}đ
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {provider.code}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {topProviders.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">
                                    Chưa có dữ liệu
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Thao tác nhanh</CardTitle>
                    <CardDescription>
                        Truy cập nhanh các chức năng vận chuyển
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Button asChild variant="outline" className="h-20 flex-col gap-2">
                            <Link href="/admin/shipping/providers/new">
                                <Truck className="h-6 w-6" />
                                <span>Thêm nhà vận chuyển</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-20 flex-col gap-2">
                            <Link href="/admin/shipping/rates/new">
                                <Package className="h-6 w-6" />
                                <span>Thêm biểu giá</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-20 flex-col gap-2">
                            <Link href="/admin/shipping/shipments/new">
                                <BarChart3 className="h-6 w-6" />
                                <span>Tạo đơn hàng</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-20 flex-col gap-2">
                            <Link href="/admin/shipping/shipments">
                                <DollarSign className="h-6 w-6" />
                                <span>Quản lý đơn hàng</span>
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ShippingDashboardPage 