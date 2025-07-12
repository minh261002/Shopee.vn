"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { api } from '@/lib/axios'
import { ArrowLeft, Edit, Trash2, Settings, Package, Truck, DollarSign, Globe, Key } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface ShippingProvider {
    id: string
    name: string
    code: string
    description?: string
    logo?: string
    website?: string
    apiKey?: string
    apiSecret?: string
    apiUrl?: string
    isActive: boolean
    createdAt: string
    updatedAt: string
    _count: {
        shippingRates: number
        shipments: number
    }
    shippingRates: Array<{
        id: string
        name: string
        method: string
        basePrice: number
        perKgPrice: number
        estimatedDays: number
        isActive: boolean
    }>
    shipments: Array<{
        id: string
        orderId: string
        status: string
        trackingNumber?: string
        shippingFee: number
        createdAt: string
        order: {
            orderNumber: string
        }
    }>
}

const ProviderDetailPage = () => {
    const router = useRouter()
    const params = useParams()
    const [provider, setProvider] = useState<ShippingProvider | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchProvider = async () => {
        try {
            setIsLoading(true)
            const response = await api.get(`/admin/shipping/providers/${params.id}`)
            setProvider(response.data)
        } catch (error) {
            console.error('Error fetching provider:', error)
            toast.error('Không thể tải thông tin nhà vận chuyển')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (params.id) {
            fetchProvider()
        }
    }, [params.id])

    const handleToggleStatus = async () => {
        if (!provider) return

        try {
            await api.put(`/admin/shipping/providers/${provider.id}`, {
                isActive: !provider.isActive
            })
            toast.success(`Đã ${provider.isActive ? 'tắt' : 'bật'} nhà vận chuyển`)
            fetchProvider()
        } catch (error) {
            console.error('Error toggling provider status:', error)
            toast.error('Có lỗi xảy ra khi cập nhật trạng thái')
        }
    }

    const handleDelete = async () => {
        if (!provider) return

        try {
            await api.delete(`/admin/shipping/providers/${provider.id}`)
            toast.success('Xóa nhà vận chuyển thành công')
            router.push('/admin/shipping/providers')
        } catch (error) {
            console.error('Error deleting provider:', error)
            toast.error('Có lỗi xảy ra khi xóa nhà vận chuyển')
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-32 bg-muted rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (!provider) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-center text-muted-foreground">
                            Không tìm thấy nhà vận chuyển
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
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.back()}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={provider.isActive ? "destructive" : "default"}
                        size="sm"
                        onClick={handleToggleStatus}
                    >
                        <Settings className="h-4 w-4 mr-2" />
                        {provider.isActive ? 'Tắt hoạt động' : 'Bật hoạt động'}
                    </Button>
                    <Button asChild size="sm">
                        <Link href={`/admin/shipping/providers/${provider.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                        </Link>
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Xóa
                    </Button>
                </div>
            </div>

            {/* Provider Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                                {provider.logo ? (
                                    <Image
                                        src={provider.logo}
                                        alt={provider.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Truck className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <CardTitle className="text-2xl">{provider.name}</CardTitle>
                                <CardDescription>
                                    Mã: {provider.code} • {provider._count.shippingRates} biểu giá • {provider._count.shipments} đơn hàng
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {provider.description && (
                            <div>
                                <h4 className="font-medium mb-2">Mô tả</h4>
                                <p className="text-muted-foreground">{provider.description}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                    {provider.website ? (
                                        <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            {provider.website}
                                        </a>
                                    ) : (
                                        'Chưa có website'
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Key className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                    {provider.apiKey ? 'Đã cấu hình API' : 'Chưa cấu hình API'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge variant={provider.isActive ? "default" : "secondary"}>
                                {provider.isActive ? "Hoạt động" : "Không hoạt động"}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                Tạo lúc {new Date(provider.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle>Thống kê</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Biểu giá</span>
                            </div>
                            <Badge variant="outline">{provider._count.shippingRates}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Đơn hàng</span>
                            </div>
                            <Badge variant="outline">{provider._count.shipments}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Doanh thu</span>
                            </div>
                            <Badge variant="outline">
                                {provider.shipments.reduce((sum, s) => sum + s.shippingFee, 0).toLocaleString('vi-VN')}đ
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Shipping Rates */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Biểu giá vận chuyển</CardTitle>
                            <CardDescription>
                                {provider.shippingRates.length} biểu giá
                            </CardDescription>
                        </div>
                        <Button asChild size="sm">
                            <Link href={`/admin/shipping/rates/new?providerId=${provider.id}`}>
                                <Package className="h-4 w-4 mr-2" />
                                Thêm biểu giá
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {provider.shippingRates.map((rate) => (
                            <div key={rate.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="font-medium">{rate.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {rate.method} • {rate.estimatedDays} ngày
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="font-medium">{rate.basePrice.toLocaleString('vi-VN')}đ</p>
                                        <p className="text-sm text-muted-foreground">
                                            +{rate.perKgPrice.toLocaleString('vi-VN')}đ/kg
                                        </p>
                                    </div>
                                    <Badge variant={rate.isActive ? "default" : "secondary"}>
                                        {rate.isActive ? "Hoạt động" : "Không hoạt động"}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                        {provider.shippingRates.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">
                                Chưa có biểu giá nào
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Shipments */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Đơn hàng gần đây</CardTitle>
                            <CardDescription>
                                {provider.shipments.length} đơn hàng
                            </CardDescription>
                        </div>
                        <Button asChild size="sm">
                            <Link href={`/admin/shipping/shipments?providerId=${provider.id}`}>
                                <Truck className="h-4 w-4 mr-2" />
                                Xem tất cả
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {provider.shipments.slice(0, 5).map((shipment) => (
                            <div key={shipment.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="font-medium">{shipment.order.orderNumber}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {shipment.trackingNumber ? `Mã vận đơn: ${shipment.trackingNumber}` : 'Chưa có mã vận đơn'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="font-medium">{shipment.shippingFee.toLocaleString('vi-VN')}đ</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(shipment.createdAt).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                    <Badge variant="outline">{shipment.status}</Badge>
                                </div>
                            </div>
                        ))}
                        {provider.shipments.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">
                                Chưa có đơn hàng nào
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ProviderDetailPage 