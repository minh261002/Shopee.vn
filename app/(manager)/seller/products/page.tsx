"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/dataTables/data-table'
import { Package, Plus, Search, Edit, Trash2, Eye, MoreHorizontal, Download } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
    const [selectedProducts, setSelectedProducts] = useState<string[]>([])
    const [isBulkDeleting, setIsBulkDeleting] = useState(false)
    const [statusFilter, setStatusFilter] = useState<ProductStatus | 'ALL'>('ALL')
    const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK' | 'LOW_STOCK'>('ALL')
    const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'updatedAt'>('updatedAt')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const { currentStore } = useStore()

    useEffect(() => {
        const fetchProducts = async () => {
            if (!currentStore) {
                setIsLoading(false)
                return
            }

            try {
                const response = await api.get(`/seller/products?storeId=${currentStore.id}`)
                setProducts(response.data.products || [])
            } catch (error) {
                console.error('Error fetching products:', error)
                showError('Không thể tải danh sách sản phẩm')
            } finally {
                setIsLoading(false)
            }
        }

        fetchProducts()
    }, [showError, currentStore])

    const handleDelete = async (productId: string) => {
        try {
            await api.delete(`/seller/products/${productId}?storeId=${currentStore?.id}`)
            setProducts(products.filter(product => product.id !== productId))
            success('Xóa sản phẩm thành công')
        } catch (error) {
            console.error('Error deleting product:', error)
            showError('Có lỗi xảy ra khi xóa sản phẩm')
        }
    }

    const handleBulkDelete = async () => {
        if (selectedProducts.length === 0) return

        setIsBulkDeleting(true)
        try {
            await Promise.all(
                selectedProducts.map(id =>
                    api.delete(`/seller/products/${id}?storeId=${currentStore?.id}`)
                )
            )
            setProducts(products.filter(product => !selectedProducts.includes(product.id)))
            setSelectedProducts([])
            success(`Đã xóa ${selectedProducts.length} sản phẩm thành công`)
        } catch (error) {
            console.error('Error bulk deleting products:', error)
            showError('Có lỗi xảy ra khi xóa sản phẩm')
        } finally {
            setIsBulkDeleting(false)
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
        setStatusFilter('ALL')
        setStockFilter('ALL')
        setSortBy('updatedAt')
        setSortOrder('desc')
        setSelectedProducts([])
    }

    const handleExportCSV = () => {
        const headers = [
            'ID', 'Tên sản phẩm', 'SKU', 'Giá gốc', 'Giá khuyến mãi',
            'Tồn kho', 'Đã bán', 'Trạng thái', 'Danh mục', 'Cập nhật'
        ]

        const csvData = filteredProducts.map(product => [
            product.id,
            product.name,
            product.sku || '',
            product.originalPrice,
            product.salePrice || '',
            product.stock,
            product.purchaseCount,
            getStatusText(product.status),
            product.category?.name || '',
            format(new Date(product.updatedAt), 'dd/MM/yyyy', { locale: vi })
        ])

        const csvContent = [headers, ...csvData]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `products-${format(new Date(), 'yyyy-MM-dd')}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
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
            id: 'select',
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

    const filteredProducts = products
        .filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.category?.name.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesStatus = statusFilter === 'ALL' || product.status === statusFilter

            const matchesStock = stockFilter === 'ALL' ||
                (stockFilter === 'IN_STOCK' && product.stock > 0) ||
                (stockFilter === 'OUT_OF_STOCK' && product.stock === 0) ||
                (stockFilter === 'LOW_STOCK' && product.stock > 0 && product.stock <= 10)

            return matchesSearch && matchesStatus && matchesStock
        })
        .sort((a, b) => {
            let aValue: number | string | Date, bValue: number | string | Date

            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase()
                    bValue = b.name.toLowerCase()
                    break
                case 'price':
                    aValue = a.originalPrice
                    bValue = b.originalPrice
                    break
                case 'stock':
                    aValue = a.stock
                    bValue = b.stock
                    break
                case 'updatedAt':
                default:
                    aValue = new Date(a.updatedAt)
                    bValue = new Date(b.updatedAt)
                    break
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1
            } else {
                return aValue < bValue ? 1 : -1
            }
        })

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
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {/* Status Filter */}
                            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProductStatus | 'ALL')}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Lọc theo trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                                    <SelectItem value="ACTIVE">Đang bán</SelectItem>
                                    <SelectItem value="DRAFT">Bản nháp</SelectItem>
                                    <SelectItem value="PENDING_APPROVAL">Chờ duyệt</SelectItem>
                                    <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
                                    <SelectItem value="OUT_OF_STOCK">Hết hàng</SelectItem>
                                    <SelectItem value="DISCONTINUED">Ngừng bán</SelectItem>
                                    <SelectItem value="REJECTED">Bị từ chối</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Stock Filter */}
                            <Select value={stockFilter} onValueChange={(value) => setStockFilter(value as 'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK' | 'LOW_STOCK')}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Lọc theo tồn kho" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tất cả tồn kho</SelectItem>
                                    <SelectItem value="IN_STOCK">Còn hàng</SelectItem>
                                    <SelectItem value="OUT_OF_STOCK">Hết hàng</SelectItem>
                                    <SelectItem value="LOW_STOCK">Tồn kho thấp</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Sort Options */}
                            <div className="flex items-center gap-2">
                                <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Sắp xếp theo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="updatedAt">Ngày cập nhật</SelectItem>
                                        <SelectItem value="name">Tên sản phẩm</SelectItem>
                                        <SelectItem value="price">Giá</SelectItem>
                                        <SelectItem value="stock">Tồn kho</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                >
                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {selectedProducts.length > 0 && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" disabled={isBulkDeleting}>
                                            {isBulkDeleting ? 'Đang xóa...' : `Xóa ${selectedProducts.length} sản phẩm`}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Xác nhận xóa sản phẩm</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Bạn có chắc chắn muốn xóa {selectedProducts.length} sản phẩm đã chọn?
                                                Hành động này không thể hoàn tác.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleBulkDelete}
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                Xóa sản phẩm
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}

                            <Button variant="outline" onClick={handleExportCSV}>
                                <Download className="w-4 h-4 mr-2" />
                                Xuất CSV
                            </Button>

                            {/* Reset Filters */}
                            {(searchTerm || statusFilter !== 'ALL' || stockFilter !== 'ALL' || sortBy !== 'updatedAt' || sortOrder !== 'desc') && (
                                <Button variant="ghost" onClick={resetFilters} size="sm">
                                    Xóa bộ lọc
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Filter Results Info */}
                    {(searchTerm || statusFilter !== 'ALL' || stockFilter !== 'ALL') && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Hiển thị {filteredProducts.length} trong tổng số {products.length} sản phẩm</span>
                        </div>
                    )}

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