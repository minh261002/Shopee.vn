"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, ExternalLink, Package, Tag, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { api } from '@/lib/axios'
import { useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
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
import { useToast } from '@/hooks/use-toast'

interface Product {
    id: string
    name: string
    slug: string
    originalPrice: number
    status: string
    images: Array<{
        url: string
        alt: string | null
    }>
}

interface Brand {
    id: string
    name: string
    slug: string
    description?: string
    logo?: string
    website?: string
    isActive: boolean
    isFeatured: boolean
    createdAt: string
    updatedAt: string
    _count: {
        products: number
    }
    products: Product[]
}

interface BrandDetailProps {
    params: {
        id: string
    }
}

const BrandDetail: React.FC<BrandDetailProps> = ({ params }) => {
    const router = useRouter()
    const { success, error: showError } = useToast()
    const [brand, setBrand] = useState<Brand | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchBrand = async () => {
            try {
                const response = await api.get(`/admin/brands/${params.id}`)
                setBrand(response.data)
            } catch (error) {
                console.error('Error fetching brand:', error)
                showError('Không thể tải thông tin thương hiệu')
                router.push('/admin/brands')
            } finally {
                setIsLoading(false)
            }
        }

        fetchBrand()
    }, [params.id, router, showError])

    const handleDelete = async () => {
        if (!brand) return

        try {
            await api.delete(`/admin/brands/${brand.id}`)
            success('Xóa thương hiệu thành công')
            router.push('/admin/brands')
        } catch (error) {
            console.error('Error deleting brand:', error)
            showError('Có lỗi xảy ra khi xóa thương hiệu')
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-16 w-full" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-[300px] w-full" />
                        <Skeleton className="h-[400px] w-full" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-[200px] w-full" />
                        <Skeleton className="h-[100px] w-full" />
                    </div>
                </div>
            </div>
        )
    }

    if (!brand) {
        return <div>Không tìm thấy thương hiệu</div>
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/brands">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Quay lại
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        <Tag className="w-5 h-5" />
                        <h1 className="text-2xl font-bold">{brand.name}</h1>
                        <div className="flex gap-2">
                            <Badge variant={brand.isActive ? 'default' : 'secondary'}>
                                {brand.isActive ? 'Hoạt động' : 'Không hoạt động'}
                            </Badge>
                            {brand.isFeatured && (
                                <Badge variant="outline">Nổi bật</Badge>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button asChild>
                        <Link href={`/admin/brands/${brand.id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                        </Link>
                    </Button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Xóa
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Xác nhận xóa thương hiệu</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Bạn có chắc chắn muốn xóa thương hiệu &quot;{brand.name}&quot;?
                                    Hành động này không thể hoàn tác.
                                    {brand._count.products > 0 && (
                                        <span className="block mt-2 text-red-600 font-medium">
                                            Thương hiệu này có {brand._count.products} sản phẩm.
                                            Bạn cần chuyển hoặc xóa các sản phẩm trước khi xóa thương hiệu.
                                        </span>
                                    )}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={brand._count.products > 0}
                                >
                                    Xóa thương hiệu
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Brand Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin thương hiệu</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                    {brand.logo ? (
                                        <Image
                                            src={brand.logo}
                                            alt={brand.name}
                                            width={80}
                                            height={80}
                                            className="object-cover"
                                        />
                                    ) : (
                                        <Tag className="w-8 h-8 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Tên thương hiệu</p>
                                        <p className="text-lg font-semibold">{brand.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">URL Slug</p>
                                        <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{brand.slug}</p>
                                    </div>
                                </div>
                            </div>

                            {brand.description && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Mô tả</p>
                                    <p className="text-sm leading-relaxed">{brand.description}</p>
                                </div>
                            )}

                            {brand.website && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Website</p>
                                    <a
                                        href={brand.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        {brand.website}
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Ngày tạo</p>
                                    <p className="text-sm">{format(new Date(brand.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Cập nhật cuối</p>
                                    <p className="text-sm">{format(new Date(brand.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Products */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Sản phẩm ({brand._count.products})
                                </CardTitle>
                                {brand._count.products > 5 && (
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/admin/products?brand=${brand.id}`}>
                                            Xem tất cả
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {brand.products.length === 0 ? (
                                <div className="text-center py-8">
                                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-muted-foreground">Chưa có sản phẩm nào</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {brand.products.map(product => (
                                        <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg">
                                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                                                {product.images[0] ? (
                                                    <Image
                                                        src={product.images[0].url}
                                                        alt={product.images[0].alt || product.name}
                                                        width={64}
                                                        height={64}
                                                        className="object-cover w-full h-full"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-6 h-6 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{product.name}</p>
                                                <p className="text-sm text-muted-foreground">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.originalPrice)}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={product.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                                    {product.status}
                                                </Badge>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/admin/products/${product.id}`}>
                                                        Xem
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thống kê</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <p className="text-2xl font-bold text-blue-600">{brand._count.products}</p>
                                <p className="text-sm text-muted-foreground">Tổng sản phẩm</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Hành động nhanh</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button className="w-full" asChild>
                                <Link href={`/admin/products/new?brand=${brand.id}`}>
                                    <Package className="w-4 h-4 mr-2" />
                                    Thêm sản phẩm
                                </Link>
                            </Button>
                            <Button variant="outline" className="w-full" asChild>
                                <Link href={`/admin/products?brand=${brand.id}`}>
                                    Quản lý sản phẩm
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default BrandDetail 