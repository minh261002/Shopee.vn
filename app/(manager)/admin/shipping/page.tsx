"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { api } from '@/lib/axios'
import { Truck, Package, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface ShippingStats {
    totalProviders: number
    activeProviders: number
    totalRates: number
    activeRates: number
    totalShipments: number
    deliveredShipments: number
    inTransitShipments: number
    pendingShipments: number
    totalRevenue: number
    monthlyRevenue: number
    recentShipments: Array<{
        id: string
        orderId: string
        status: string
        provider: {
            name: string
            code: string
        }
        order: {
            orderNumber: string
        }
        createdAt: string
    }>
    topProviders: Array<{
        id: string
        name: string
        code: string
        shipmentCount: number
        revenue: number
    }>
}

const ShippingDashboardPage = () => {
    const [stats, setStats] = useState<ShippingStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Fetch shipping stats
    const fetchStats = async () => {
        try {
            setIsLoading(true)
            const response = await api.get('/admin/shipping/stats')
            setStats(response.data)
        } catch (error) {
            console.error('Error fetching shipping stats:', error)
            toast.error('Không thể tải thống kê vận chuyển')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
    }, [])

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string, icon: React.ComponentType<{ className?: string }> }> = {
            'PENDING': { variant: 'secondary', label: 'Chờ xử lý', icon: Clock },
            'CONFIRMED': { variant: 'outline', label: 'Đã xác nhận', icon: CheckCircle },
            'PICKED_UP': { variant: 'default', label: 'Đã lấy hàng', icon: Truck },
            'IN_TRANSIT': { variant: 'default', label: 'Đang vận chuyển', icon: Truck },
            'OUT_FOR_DELIVERY': { variant: 'default', label: 'Đang giao hàng', icon: Truck },
            'DELIVERED': { variant: 'default', label: 'Đã giao hàng', icon: CheckCircle },
            'FAILED_DELIVERY': { variant: 'destructive', label: 'Giao hàng thất bại', icon: AlertCircle },
            'RETURNED_TO_SENDER': { variant: 'destructive', label: 'Đã trả về', icon: AlertCircle },
        }
        return statusMap[status] || { variant: 'secondary', label: status, icon: Clock }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="animate-pulse">
                                    <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                                    <div className="h-8 bg-muted rounded w-1/3"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-center text-muted-foreground">
                            Không thể tải dữ liệu thống kê
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Tổng quan vận chuyển</h1>
                    <p className="text-muted-foreground">
                        Quản lý và theo dõi hoạt động vận chuyển
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild>
                        <Link href="/admin/shipping/providers">
                            <Truck className="w-4 h-4 mr-2" />
                            Quản lý nhà vận chuyển
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/admin/shipping/shipments">
                            <Package className="w-4 h-4 mr-2" />
                            Quản lý đơn hàng
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
                        <div className="text-2xl font-bold">{stats.totalProviders}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.activeProviders} đang hoạt động
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Biểu giá</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalRates}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.activeRates} đang hoạt động
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đơn hàng</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalShipments}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.deliveredShipments} đã giao hàng
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
                            {stats.totalRevenue.toLocaleString('vi-VN')}đ
                        </div>
                        <p className="text-xs text-muted-foreground">
                            +{stats.monthlyRevenue.toLocaleString('vi-VN')}đ tháng này
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Shipment Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Trạng thái đơn hàng</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Chờ xử lý</span>
                            </div>
                            <Badge variant="secondary">{stats.pendingShipments}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Đang vận chuyển</span>
                            </div>
                            <Badge variant="default">{stats.inTransitShipments}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Đã giao hàng</span>
                            </div>
                            <Badge variant="default">{stats.deliveredShipments}</Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Shipments */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">Đơn hàng gần đây</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {stats.recentShipments.map((shipment) => {
                                const { variant, label, icon: Icon } = getStatusBadge(shipment.status)
                                return (
                                    <div key={shipment.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Icon className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">{shipment.order.orderNumber}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {shipment.provider.name} ({shipment.provider.code})
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={variant}>{label}</Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(shipment.createdAt).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Providers */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Nhà vận chuyển hàng đầu</CardTitle>
                    <CardDescription>
                        Dựa trên số lượng đơn hàng và doanh thu
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats.topProviders.map((provider, index) => (
                            <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium">{provider.name}</p>
                                        <p className="text-sm text-muted-foreground">{provider.code}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">{provider.shipmentCount} đơn hàng</p>
                                    <p className="text-sm text-muted-foreground">
                                        {provider.revenue.toLocaleString('vi-VN')}đ
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Quản lý nhà vận chuyển</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button asChild className="w-full">
                            <Link href="/admin/shipping/providers">
                                <Truck className="w-4 h-4 mr-2" />
                                Xem tất cả nhà vận chuyển
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/admin/shipping/providers/new">
                                Thêm nhà vận chuyển mới
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Quản lý biểu giá</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button asChild className="w-full">
                            <Link href="/admin/shipping/rates">
                                <Package className="w-4 h-4 mr-2" />
                                Xem tất cả biểu giá
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/admin/shipping/rates/new">
                                Thêm biểu giá mới
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Quản lý đơn hàng</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button asChild className="w-full">
                            <Link href="/admin/shipping/shipments">
                                <Package className="w-4 h-4 mr-2" />
                                Xem tất cả đơn hàng
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/admin/shipping/shipments/new">
                                Tạo đơn vận chuyển mới
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default ShippingDashboardPage 