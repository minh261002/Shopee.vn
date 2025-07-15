"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle, XCircle, Package, Store, Star, BarChart3 } from 'lucide-react'
import Image from 'next/image'
import { useRouter, useParams } from 'next/navigation'
import { api } from '@/lib/axios'
import { useToast } from '@/hooks/use-toast'
import { ProductStatus } from '@prisma/client'

interface Product {
    id: string
    name: string
    slug: string
    description?: string
    shortDescription?: string
    sku?: string
    originalPrice: number
    salePrice?: number
    stock: number
    status: ProductStatus
    condition: string
    weight?: number
    length?: number
    width?: number
    height?: number
    images: string[]
    tags: string[]
    features?: Record<string, unknown>
    specifications?: Record<string, unknown>
    isDigital: boolean
    isFeatured: boolean
    requiresShipping: boolean
    viewCount: number
    purchaseCount: number
    rating: number
    reviewCount: number
    wishlistCount: number
    category?: {
        id: string
        name: string
        slug: string
    }
    brand?: {
        id: string
        name: string
        slug: string
        logo?: string
    }
    store: {
        id: string
        name: string
        slug: string
        logo?: string
        rating: number
        isVerified: boolean
        owner: {
            id: string
            name: string
            email: string
        }
    }
    variants: Array<{
        id: string
        name: string
        sku: string
        price?: number
        stock: number
        attributes: Record<string, unknown>
        isActive: boolean
    }>
    createdAt: string
    updatedAt: string
}

const AdminProductDetailPage = () => {
    const { success, error: showError } = useToast()
    const router = useRouter()
    const params = useParams()
    const [product, setProduct] = useState<Product | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isApproving, setIsApproving] = useState(false)
    const [isRejecting, setIsRejecting] = useState(false)

    useEffect(() => {
        if (params.id) {
            fetchProduct()
        }
    }, [params.id])

    const fetchProduct = async () => {
        try {
            setIsLoading(true)
            const response = await api.get(`/admin/products/${params.id}`)
            setProduct(response.data)
        } catch (error) {
            console.error('Error fetching product:', error)
            showError('Không thể tải thông tin sản phẩm')
        } finally {
            setIsLoading(false)
        }
    }

    const handleApprove = async () => {
        if (!product) return

        try {
            setIsApproving(true)
            await api.put(`/admin/products/${product.id}/approve`)
            success('Phê duyệt sản phẩm thành công')
            router.push('/admin/products')
        } catch (error) {
            console.error('Error approving product:', error)
            showError('Có lỗi xảy ra khi phê duyệt sản phẩm')
        } finally {
            setIsApproving(false)
        }
    }

    const handleReject = async () => {
        if (!product) return

        try {
            setIsRejecting(true)
            await api.put(`/admin/products/${product.id}/reject`)
            success('Từ chối sản phẩm thành công')
            router.push('/admin/products')
        } catch (error) {
            console.error('Error rejecting product:', error)
            showError('Có lỗi xảy ra khi từ chối sản phẩm')
        } finally {
            setIsRejecting(false)
        }
    }

    const getStatusBadge = (status: ProductStatus) => {
        switch (status) {
            case 'ACTIVE':
                return <Badge variant="default">Đang bán</Badge>
            case 'PENDING_APPROVAL':
                return <Badge variant="secondary">Chờ duyệt</Badge>
            case 'DRAFT':
                return <Badge variant="outline">Bản nháp</Badge>
            case 'INACTIVE':
                return <Badge variant="destructive">Đã ẩn</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Không tìm thấy sản phẩm</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Chi tiết sản phẩm</h1>
                        <p className="text-muted-foreground">
                            Xem xét thông tin sản phẩm trước khi duyệt
                        </p>
                    </div>
                </div>

                {/* Action buttons for pending products */}
                {product.status === 'PENDING_APPROVAL' && (
                    <div className="flex items-center space-x-2">
                        <Button
                            onClick={handleApprove}
                            disabled={isApproving || isRejecting}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {isApproving ? 'Đang duyệt...' : 'Phê duyệt'}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={isApproving || isRejecting}
                        >
                            <XCircle className="h-4 w-4 mr-2" />
                            {isRejecting ? 'Đang từ chối...' : 'Từ chối'}
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Product Images */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Hình ảnh sản phẩm
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {product.images && product.images.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {product.images.map((image, index) => (
                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                                            <Image
                                                src={image}
                                                alt={`${product.name} - ${index + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg">
                                    <Package className="h-8 w-8 text-gray-400" />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Product Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin sản phẩm</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold">{product.name}</h3>
                                {product.sku && (
                                    <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                                )}
                            </div>

                            {product.description && (
                                <div>
                                    <h4 className="font-medium mb-2">Mô tả</h4>
                                    <p className="text-sm text-muted-foreground">{product.description}</p>
                                </div>
                            )}

                            {product.shortDescription && (
                                <div>
                                    <h4 className="font-medium mb-2">Mô tả ngắn</h4>
                                    <p className="text-sm text-muted-foreground">{product.shortDescription}</p>
                                </div>
                            )}

                            {/* Pricing */}
                            <div className="flex items-center space-x-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Giá gốc</p>
                                    <p className="text-lg font-semibold">
                                        {typeof product.originalPrice === 'number'
                                            ? product.originalPrice.toLocaleString('vi-VN') + 'đ'
                                            : '—'}
                                    </p>
                                </div>
                                {product.salePrice && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Giá khuyến mãi</p>
                                        <p className="text-lg font-semibold text-red-600">
                                            {typeof product.salePrice === 'number'
                                                ? product.salePrice.toLocaleString('vi-VN') + 'đ'
                                                : '—'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Physical properties */}
                            {(product.weight || product.length || product.width || product.height) && (
                                <div>
                                    <h4 className="font-medium mb-2">Thông số vật lý</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        {product.weight && (
                                            <div>
                                                <p className="text-muted-foreground">Cân nặng</p>
                                                <p>{product.weight}kg</p>
                                            </div>
                                        )}
                                        {product.length && (
                                            <div>
                                                <p className="text-muted-foreground">Chiều dài</p>
                                                <p>{product.length}cm</p>
                                            </div>
                                        )}
                                        {product.width && (
                                            <div>
                                                <p className="text-muted-foreground">Chiều rộng</p>
                                                <p>{product.width}cm</p>
                                            </div>
                                        )}
                                        {product.height && (
                                            <div>
                                                <p className="text-muted-foreground">Chiều cao</p>
                                                <p>{product.height}cm</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Tags */}
                            {product.tags && product.tags.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-2">Tags</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {product.tags.map((tag, index) => (
                                            <Badge key={index} variant="secondary">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Variants */}
                            {product.variants && product.variants.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-2">Biến thể</h4>
                                    <div className="space-y-2">
                                        {product.variants.map((variant) => (
                                            <div key={variant.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <p className="font-medium">{variant.name}</p>
                                                    <p className="text-sm text-muted-foreground">SKU: {variant.sku}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">
                                                        {variant.price
                                                            ? variant.price.toLocaleString('vi-VN') + 'đ'
                                                            : '—'}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Tồn kho: {variant.stock}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status and Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Trạng thái</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                {getStatusBadge(product.status)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                <p>Tạo lúc: {new Date(product.createdAt).toLocaleString('vi-VN')}</p>
                                <p>Cập nhật: {new Date(product.updatedAt).toLocaleString('vi-VN')}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Store Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Store className="h-5 w-5" />
                                Thông tin cửa hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-3">
                                {product.store.logo ? (
                                    <Image
                                        src={product.store.logo}
                                        alt={product.store.name}
                                        width={40}
                                        height={40}
                                        className="rounded-md"
                                    />
                                ) : (
                                    <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                                        <Store className="w-5 h-5 text-gray-400" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium">{product.store.name}</p>
                                    <p className="text-sm text-muted-foreground">{product.store.owner.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm">{product.store.rating.toFixed(1)}/5</span>
                                {product.store.isVerified && (
                                    <Badge variant="default" className="text-xs">Đã xác thực</Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Thống kê
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{product.viewCount}</p>
                                    <p className="text-sm text-muted-foreground">Lượt xem</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{product.purchaseCount}</p>
                                    <p className="text-sm text-muted-foreground">Đã bán</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{product.reviewCount}</p>
                                    <p className="text-sm text-muted-foreground">Đánh giá</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{product.wishlistCount}</p>
                                    <p className="text-sm text-muted-foreground">Yêu thích</p>
                                </div>
                            </div>
                            {product.rating > 0 && (
                                <div className="flex items-center justify-center space-x-1">
                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                    <span className="font-medium">{product.rating.toFixed(1)}/5</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Category and Brand */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Phân loại</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {product.category && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Danh mục</p>
                                    <p className="font-medium">{product.category.name}</p>
                                </div>
                            )}
                            {product.brand && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Thương hiệu</p>
                                    <div className="flex items-center space-x-2">
                                        {product.brand.logo && (
                                            <Image
                                                src={product.brand.logo}
                                                alt={product.brand.name}
                                                width={24}
                                                height={24}
                                                className="rounded"
                                            />
                                        )}
                                        <p className="font-medium">{product.brand.name}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default AdminProductDetailPage 