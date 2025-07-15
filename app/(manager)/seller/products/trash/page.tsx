"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/dataTables/data-table'
import { Package, RotateCcw, Trash2, Eye, MoreHorizontal, Search } from 'lucide-react'
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
import { useStore } from '@/providers/store-context'

import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ProductStatus } from '@prisma/client'
import { useToast } from '@/hooks/use-toast'
import { Checkbox } from '@/components/ui/checkbox'

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
    _count: {
        orderItems: number
        reviews: number
    }
}

const TrashProductsList = () => {
    const { success, error: showError } = useToast()
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedProducts, setSelectedProducts] = useState<string[]>([])
    const [isBulkRestoring, setIsBulkRestoring] = useState(false)
    const { currentStore } = useStore()

    useEffect(() => {
        const fetchProducts = async () => {
            if (!currentStore) {
                setIsLoading(false)
                return
            }

            try {
                const response = await api.get(`/seller/products/trash?storeId=${currentStore.id}`)
                setProducts(response.data.products || [])
            } catch (error) {
                console.error('Error fetching deleted products:', error)
                showError('Không thể tải danh sách sản phẩm đã ẩn')
            } finally {
                setIsLoading(false)
            }
        }

        fetchProducts()
    }, [showError, currentStore])

    const handleRestore = async (productId: string) => {
        try {
            await api.post(`/seller/products/${productId}/restore?storeId=${currentStore?.id}`)
            setProducts(products.filter(product => product.id !== productId))
            success('Khôi phục sản phẩm thành công')
        } catch (error) {
            console.error('Error restoring product:', error)
            showError('Có lỗi xảy ra khi khôi phục sản phẩm')
        }
    }

    const handleBulkRestore = async () => {
        if (selectedProducts.length === 0) return

        setIsBulkRestoring(true)
        try {
            await Promise.all(
                selectedProducts.map(id =>
                    api.post(`/seller/products/${id}/restore?storeId=${currentStore?.id}`)
                )
            )
            setProducts(products.filter(product => !selectedProducts.includes(product.id)))
            setSelectedProducts([])
            success(`Đã khôi phục ${selectedProducts.length} sản phẩm thành công`)
        } catch (error) {
            console.error('Error bulk restoring products:', error)
            showError('Có lỗi xảy ra khi khôi phục sản phẩm')
        } finally {
            setIsBulkRestoring(false)
        }
    }

    const handleSelectAll = () => {
        if (selectedProducts.length === filteredProducts.length) {
            setSelectedProducts([])
        } else {
            setSelectedProducts(filteredProducts.map(p => p.id))
        }
    }

    const handleSelectProduct = (productId: string) => {
        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        )
    }

    const resetFilters = () => {
        setSearchTerm('')
        setSelectedProducts([])
    }

    const filteredProducts = products
        .filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.category?.name.toLowerCase().includes(searchTerm.toLowerCase())

            return matchesSearch
        })
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    const columns: ColumnDef<Product>[] = [
        {
            id: "select",
            header: () => (
                <Checkbox
                    checked={selectedProducts.length === filteredProducts.length}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={selectedProducts.includes(row.original.id)}
                    onCheckedChange={() => handleSelectProduct(row.original.id)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "images",
            header: "Ảnh",
            cell: ({ row }) => {
                const images = row.original.images
                return (
                    <div className="flex items-center space-x-2">
                        {images && images.length > 0 ? (
                            <Image
                                src={images[0]}
                                alt={row.original.name}
                                width={40}
                                height={40}
                                className="rounded-md object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                                <Package className="w-4 h-4 text-gray-400" />
                            </div>
                        )}
                    </div>
                )
            },
        },
        {
            accessorKey: "name",
            header: "Tên sản phẩm",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.name}</span>
                    {row.original.sku && (
                        <span className="text-sm text-gray-500">SKU: {row.original.sku}</span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "category",
            header: "Danh mục",
            cell: ({ row }) => row.original.category?.name || "-",
        },
        {
            accessorKey: "originalPrice",
            header: "Giá",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">
                        {row.original.originalPrice.toLocaleString('vi-VN')}đ
                    </span>
                    {row.original.salePrice && (
                        <span className="text-sm text-red-500 line-through">
                            {row.original.salePrice.toLocaleString('vi-VN')}đ
                        </span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "stock",
            header: "Tồn kho",
            cell: ({ row }) => (
                <Badge variant={row.original.stock > 0 ? "default" : "destructive"}>
                    {row.original.stock}
                </Badge>
            ),
        },
        {
            accessorKey: "_count",
            header: "Thống kê",
            cell: ({ row }) => (
                <div className="flex flex-col text-sm">
                    <span>Đơn hàng: {row.original._count.orderItems}</span>
                    <span>Đánh giá: {row.original._count.reviews}</span>
                </div>
            ),
        },
        {
            accessorKey: "updatedAt",
            header: "Ngày ẩn",
            cell: ({ row }) => format(new Date(row.original.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi }),
        },
        {
            id: "actions",
            header: "Thao tác",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRestore(row.original.id)}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Khôi phục
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/seller/products/${row.original.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Xem chi tiết
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Đang tải...</h3>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Sản phẩm đã ẩn</h1>
                    <p className="text-muted-foreground">
                        Quản lý các sản phẩm đã bị ẩn khỏi cửa hàng
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        onClick={resetFilters}
                        disabled={!searchTerm && selectedProducts.length === 0}
                    >
                        Đặt lại
                    </Button>
                    {selectedProducts.length > 0 && (
                        <Button
                            onClick={handleBulkRestore}
                            disabled={isBulkRestoring}
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Khôi phục ({selectedProducts.length})
                        </Button>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trash2 className="h-5 w-5" />
                        Danh sách sản phẩm đã ẩn
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center py-4">
                        <Search className="mr-2 h-4 w-4" />
                        <Input
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-8">
                            <Package className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                {searchTerm ? 'Không tìm thấy sản phẩm' : 'Không có sản phẩm nào đã ẩn'}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Các sản phẩm đã ẩn sẽ xuất hiện ở đây'}
                            </p>
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={filteredProducts}
                            searchKey="name"
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default TrashProductsList 