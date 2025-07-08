"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/dataTables/data-table'
import { Package, Plus, Search, Edit, Trash2, Eye, MoreHorizontal } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ColumnDef } from '@tanstack/react-table'
import Image from 'next/image'
import Link from 'next/link'
import { api } from '@/lib/axios'

import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ProductStatus } from '@prisma/client'
import { useToast } from '@/hooks/use-toast'
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

// Local type matching our API response
interface Product {
    id: string
    name: string
    slug: string
    sku?: string
    originalPrice: number
    salePrice?: number
    stock: number
    purchaseCount: number
    status: ProductStatus
    images: string[]
    category?: {
        id: string
        name: string
    }
    updatedAt: string
}

const ProductsList = () => {
    const { success, error: showError } = useToast()
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/seller/products')
                setProducts(response.data.products || [])
            } catch (error) {
                console.error('Error fetching products:', error)
                showError('Không thể tải danh sách sản phẩm')
            } finally {
                setIsLoading(false)
            }
        }

        fetchProducts()
    }, [showError])

    const handleDelete = async (productId: string) => {
        try {
            await api.delete(`/seller/products/${productId}`)
            setProducts(products.filter(product => product.id !== productId))
            success('Xóa sản phẩm thành công')
        } catch (error) {
            console.error('Error deleting product:', error)
            showError('Có lỗi xảy ra khi xóa sản phẩm')
        }
    }

    const getStatusColor = (status: ProductStatus) => {
        switch (status) {
            case 'ACTIVE':
                return 'default'
            case 'DRAFT':
                return 'secondary'
            case 'PENDING_APPROVAL':
                return 'secondary'
            case 'INACTIVE':
                return 'destructive'
            case 'OUT_OF_STOCK':
                return 'destructive'
            case 'DISCONTINUED':
                return 'destructive'
            case 'REJECTED':
                return 'destructive'
            default:
                return 'outline'
        }
    }

    const getStatusText = (status: ProductStatus) => {
        switch (status) {
            case 'ACTIVE':
                return 'Đang bán'
            case 'DRAFT':
                return 'Bản nháp'
            case 'PENDING_APPROVAL':
                return 'Chờ duyệt'
            case 'INACTIVE':
                return 'Không hoạt động'
            case 'OUT_OF_STOCK':
                return 'Hết hàng'
            case 'DISCONTINUED':
                return 'Ngừng bán'
            case 'REJECTED':
                return 'Bị từ chối'
            default:
                return status
        }
    }

    const columns: ColumnDef<Product>[] = [
        {
            accessorKey: 'image',
            header: 'Hình ảnh',
            cell: ({ row }) => {
                const product = row.original
                return (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                        <Image
                            src={product.images[0] || '/images/logo.png'}
                            alt={product.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                )
            },
        },
        {
            accessorKey: 'name',
            header: 'Tên sản phẩm',
            cell: ({ row }) => {
                const product = row.original
                return (
                    <div className="space-y-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">SKU: {product.sku || 'N/A'}</p>
                        {product.category && (
                            <Badge variant="outline" className="text-xs">
                                {product.category.name}
                            </Badge>
                        )}
                    </div>
                )
            },
        },
        {
            accessorKey: 'price',
            header: 'Giá',
            cell: ({ row }) => {
                const product = row.original
                return (
                    <div className="space-y-1">
                        <p className="font-medium">
                            {product.originalPrice.toLocaleString('vi-VN')}đ
                        </p>
                        {product.salePrice && (
                            <p className="text-sm text-red-500">
                                Sale: {product.salePrice.toLocaleString('vi-VN')}đ
                            </p>
                        )}
                    </div>
                )
            },
        },
        {
            accessorKey: 'stock',
            header: 'Kho hàng',
            cell: ({ row }) => {
                const product = row.original
                return (
                    <div className="space-y-1">
                        <p className="font-medium">Còn: {product.stock}</p>
                        <p className="text-sm text-muted-foreground">
                            Đã bán: {product.purchaseCount}
                        </p>
                    </div>
                )
            },
        },
        {
            accessorKey: 'status',
            header: 'Trạng thái',
            cell: ({ row }) => {
                const status = row.getValue('status') as ProductStatus
                return (
                    <Badge variant={getStatusColor(status)}>
                        {getStatusText(status)}
                    </Badge>
                )
            },
        },
        {
            accessorKey: 'updatedAt',
            header: 'Cập nhật',
            cell: ({ row }) => {
                const date = row.getValue('updatedAt') as string
                return (
                    <p className="text-sm">
                        {format(new Date(date), 'dd/MM/yyyy', { locale: vi })}
                    </p>
                )
            },
        },
        {
            id: 'actions',
            header: 'Hành động',
            cell: ({ row }) => {
                const product = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Mở menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/seller/products/${product.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Xem chi tiết
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/seller/products/${product.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Chỉnh sửa
                                </Link>
                            </DropdownMenuItem>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                        className="text-red-600"
                                        onSelect={(e) => e.preventDefault()}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Xóa
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Xác nhận xóa sản phẩm</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Bạn có chắc chắn muốn xóa sản phẩm &quot;{product.name}&quot;?
                                            Hành động này không thể hoàn tác.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => handleDelete(product.id)}
                                            className="bg-red-600 hover:bg-red-700"
                                        >
                                            Xóa sản phẩm
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            <CardTitle>Quản lý sản phẩm</CardTitle>
                        </div>
                        <Button asChild>
                            <Link href="/seller/products/new">
                                <Plus className="w-4 h-4 mr-2" />
                                Thêm sản phẩm
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
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-secondary/10 rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground">Tổng sản phẩm</p>
                            <p className="text-2xl font-bold">{products.length}</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground">Đang bán</p>
                            <p className="text-2xl font-bold text-green-600">
                                {products.filter(p => p.status === 'ACTIVE').length}
                            </p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground">Bản nháp</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {products.filter(p => p.status === 'DRAFT').length}
                            </p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground">Hết hàng</p>
                            <p className="text-2xl font-bold text-red-600">
                                {products.filter(p => p.stock === 0).length}
                            </p>
                        </div>
                    </div>

                    {/* Data Table */}
                    <DataTable
                        columns={columns}
                        data={filteredProducts}
                        searchKey="name"
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default ProductsList 