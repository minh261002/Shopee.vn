"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductStatus, ProductCondition } from '@prisma/client'
import {
    ArrowLeft,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Package,
    DollarSign,
    Calendar,
    MapPin,
    Tag,
    BarChart3
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/axios'
import { useToast } from '@/hooks/use-toast'
import { useStore } from '@/providers/store-context'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface Product {
    id: string
    name: string
    slug: string
    description: string
    shortDescription: string
    originalPrice: number
    salePrice?: number
    sku: string
    weight?: number
    length?: number
    width?: number
    height?: number
    categoryId: string
    brandId?: string
    status: ProductStatus
    condition: ProductCondition
    tags: string[]
    metaTitle?: string
    metaDescription?: string
    metaKeywords?: string
    features?: string
    specifications?: string
    stock: number
    lowStockThreshold: number
    isDigital: boolean
    isFeatured: boolean
    requiresShipping: boolean
    images: string[]
    createdAt: string
    updatedAt: string
    publishedAt?: string
    category: {
        id: string
        name: string
    }
    brand?: {
        id: string
        name: string
    }
    variants: Array<{
        id: string
        name: string
        value: string
        price?: number
        stock: number
        sku: string
    }>
}

const ProductDetail = () => {
    const params = useParams()
    const router = useRouter()
    const { success, error: showError } = useToast()
    const { currentStore } = useStore()
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        const fetchProduct = async () => {
            if (!currentStore) {
                setLoading(false)
                return
            }

            try {
                const response = await api.get(`/seller/products/${params.id}?storeId=${currentStore.id}`)
                setProduct(response.data)
            } catch (error) {
                console.error('Error fetching product:', error)
                showError('Không thể tải thông tin sản phẩm')
                router.push('/seller/products')
            } finally {
                setLoading(false)
            }
        }

        if (params.id && currentStore) {
            fetchProduct()
        }
    }, [params.id, currentStore, router])

    const handleDelete = async () => {
        if (!currentStore) return

        setDeleting(true)
        try {
            await api.delete(`/seller/products/${params.id}?storeId=${currentStore.id}`)
            success('Xóa sản phẩm thành công')
            router.push('/seller/products')
        } catch (error) {
            console.error('Error deleting product:', error)
            showError('Có lỗi xảy ra khi xóa sản phẩm')
        } finally {
            setDeleting(false)
        }
    }

    const handleStatusToggle = async () => {
        if (!product || !currentStore) return

        try {
            const newStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
            const response = await api.put(`/seller/products/${params.id}?storeId=${currentStore.id}`, {
                status: newStatus
            })
            setProduct(response.data)
            success(`Đã ${newStatus === 'ACTIVE' ? 'hiện' : 'ẩn'} sản phẩm`)
        } catch (error) {
            console.error('Error updating status:', error)
            showError('Có lỗi xảy ra khi cập nhật trạng thái')
        }
    }

    const getStatusColor = (status: ProductStatus) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800'
            case 'DRAFT': return 'bg-gray-100 text-gray-800'
            case 'PENDING_APPROVAL': return 'bg-yellow-100 text-yellow-800'
            case 'INACTIVE': return 'bg-red-100 text-red-800'
            case 'OUT_OF_STOCK': return 'bg-orange-100 text-orange-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusText = (status: ProductStatus) => {
        switch (status) {
            case 'ACTIVE': return 'Đang bán'
            case 'DRAFT': return 'Bản nháp'
            case 'PENDING_APPROVAL': return 'Chờ duyệt'
            case 'INACTIVE': return 'Không hoạt động'
            case 'OUT_OF_STOCK': return 'Hết hàng'
            default: return status
        }
    }

    const getConditionText = (condition: ProductCondition) => {
        switch (condition) {
            case 'NEW': return 'Mới'
            case 'LIKE_NEW': return 'Như mới'
            case 'GOOD': return 'Tốt'
            case 'FAIR': return 'Khá'
            case 'REFURBISHED': return 'Tân trang'
            default: return condition
        }
    }

    if (loading) {
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
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">Không tìm thấy sản phẩm</h2>
                <p className="text-gray-600 mt-2">Sản phẩm này có thể đã bị xóa hoặc bạn không có quyền truy cập.</p>
                <Button asChild className="mt-4">
                    <Link href="/seller/products">Quay lại danh sách</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/seller/products">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Quay lại
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{product.name}</h1>
                        <p className="text-muted-foreground">SKU: {product.sku}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handleStatusToggle}
                        className="flex items-center gap-2"
                    >
                        {product.status === 'ACTIVE' ? (
                            <>
                                <EyeOff className="w-4 h-4" />
                                Ẩn sản phẩm
                            </>
                        ) : (
                            <>
                                <Eye className="w-4 h-4" />
                                Hiện sản phẩm
                            </>
                        )}
                    </Button>
                    <Button asChild>
                        <Link href={`/seller/products/${product.id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                        </Link>
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Xóa
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Xác nhận xóa sản phẩm</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Bạn có chắc chắn muốn xóa sản phẩm &quot;{product.name}?&quot;
                                    Hành động này không thể hoàn tác.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={deleting}
                                >
                                    {deleting ? 'Đang xóa...' : 'Xóa sản phẩm'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Images */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Hình ảnh sản phẩm</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {(product.images?.length ?? 0) > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {product.images?.map((image, index) => (
                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                                            <Image
                                                src={image}
                                                alt={`${product.name} - Image ${index + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-gray-400">Không có ảnh sản phẩm</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Description */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Mô tả sản phẩm</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {product.shortDescription && (
                                <div>
                                    <h4 className="font-medium mb-2">Mô tả ngắn</h4>
                                    <p className="text-muted-foreground">{product.shortDescription}</p>
                                </div>
                            )}
                            {product.description && (
                                <div>
                                    <h4 className="font-medium mb-2">Mô tả chi tiết</h4>
                                    <div className="text-muted-foreground whitespace-pre-wrap">
                                        {product.description}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Variants */}
                    {(product.variants?.length ?? 0) > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Biến thể sản phẩm</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {product.variants?.map((variant) => (
                                        <div key={variant.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <h4 className="font-medium">{variant.name}: {variant.value}</h4>
                                                <p className="text-sm text-muted-foreground">SKU: {variant.sku}</p>
                                            </div>
                                            <div className="text-right">
                                                {variant.price && (
                                                    <p className="font-medium">
                                                        {variant.price.toLocaleString('vi-VN')}đ
                                                    </p>
                                                )}
                                                <p className="text-sm text-muted-foreground">
                                                    Tồn kho: {variant.stock}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5" />
                                Trạng thái
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span>Trạng thái:</span>
                                <Badge className={getStatusColor(product.status)}>
                                    {getStatusText(product.status)}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Tình trạng:</span>
                                <Badge variant="outline">
                                    {getConditionText(product.condition)}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Nổi bật:</span>
                                <Badge variant={product.isFeatured ? "default" : "secondary"}>
                                    {product.isFeatured ? 'Có' : 'Không'}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Sản phẩm số:</span>
                                <Badge variant={product.isDigital ? "default" : "secondary"}>
                                    {product.isDigital ? 'Có' : 'Không'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pricing */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5" />
                                Giá cả
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span>Giá gốc:</span>
                                <span className="font-medium">
                                    {typeof product.originalPrice === 'number'
                                        ? product.originalPrice.toLocaleString('vi-VN') + 'đ'
                                        : '—'}
                                </span>
                            </div>
                            {typeof product.salePrice === 'number' && (
                                <div className="flex items-center justify-between">
                                    <span>Giá khuyến mãi:</span>
                                    <span className="font-medium text-red-600">
                                        {product.salePrice.toLocaleString('vi-VN')}đ
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Inventory */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="w-5 h-5" />
                                Kho hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span>Tồn kho:</span>
                                <Badge variant={product.stock <= product.lowStockThreshold ? "destructive" : "default"}>
                                    {product.stock}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Cảnh báo hết hàng:</span>
                                <span>{product.lowStockThreshold}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Cần vận chuyển:</span>
                                <Badge variant={product.requiresShipping ? "default" : "secondary"}>
                                    {product.requiresShipping ? 'Có' : 'Không'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Category & Brand */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Tag className="w-5 h-5" />
                                Phân loại
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <span className="text-sm text-muted-foreground">Danh mục:</span>
                                <p className="font-medium">{product.category?.name || '—'}</p>
                            </div>
                            {product.brand && (
                                <div>
                                    <span className="text-sm text-muted-foreground">Thương hiệu:</span>
                                    <p className="font-medium">{product.brand.name}</p>
                                </div>
                            )}
                            {(product.tags?.length ?? 0) > 0 && (
                                <div>
                                    <span className="text-sm text-muted-foreground">Tags:</span>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {product.tags?.map((tag, idx) => (
                                            <span key={idx} className="badge">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Physical Properties */}
                    {(product.weight || product.length || product.width || product.height) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    Thông số vật lý
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {product.weight && (
                                    <div className="flex items-center justify-between">
                                        <span>Cân nặng:</span>
                                        <span>{product.weight} kg</span>
                                    </div>
                                )}
                                {product.length && (
                                    <div className="flex items-center justify-between">
                                        <span>Chiều dài:</span>
                                        <span>{product.length} cm</span>
                                    </div>
                                )}
                                {product.width && (
                                    <div className="flex items-center justify-between">
                                        <span>Chiều rộng:</span>
                                        <span>{product.width} cm</span>
                                    </div>
                                )}
                                {product.height && (
                                    <div className="flex items-center justify-between">
                                        <span>Chiều cao:</span>
                                        <span>{product.height} cm</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Dates */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Thời gian
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <span className="text-sm text-muted-foreground">Ngày tạo:</span>
                                <p className="text-sm">
                                    {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground">Cập nhật lần cuối:</span>
                                <p className="text-sm">
                                    {new Date(product.updatedAt).toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                            {product.publishedAt && (
                                <div>
                                    <span className="text-sm text-muted-foreground">Ngày xuất bản:</span>
                                    <p className="text-sm">
                                        {new Date(product.publishedAt).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default ProductDetail 