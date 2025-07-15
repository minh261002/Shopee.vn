"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/dataTables/data-table'
import { Plus, Edit, Trash2, Eye, MoreHorizontal } from 'lucide-react'
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
import { FilterOption } from '@/components/dataTables/data-table-toolbar'

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
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
        status: 'ALL',
        stock: 'ALL'
    })
    const { currentStore } = useStore()

    // Define filters
    const filters: FilterOption[] = [
        {
            key: 'status',
            label: 'Trạng thái',
            type: 'select',
            placeholder: 'Chọn trạng thái',
            options: [
                { value: 'ACTIVE', label: 'Đang bán' },
                { value: 'DRAFT', label: 'Bản nháp' },
                { value: 'PENDING_APPROVAL', label: 'Chờ duyệt' },
                { value: 'INACTIVE', label: 'Không hoạt động' },
                { value: 'OUT_OF_STOCK', label: 'Hết hàng' },
                { value: 'DISCONTINUED', label: 'Ngừng bán' },
                { value: 'REJECTED', label: 'Bị từ chối' }
            ]
        },
        {
            key: 'stock',
            label: 'Tồn kho',
            type: 'select',
            placeholder: 'Chọn trạng thái tồn kho',
            options: [
                { value: 'IN_STOCK', label: 'Còn hàng' },
                { value: 'OUT_OF_STOCK', label: 'Hết hàng' },
                { value: 'LOW_STOCK', label: 'Tồn kho thấp' }
            ]
        }
    ]

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
            const response = await api.delete(`/seller/products/${productId}?storeId=${currentStore?.id}`)
            setProducts(products.filter(product => product.id !== productId))

            // Show appropriate message based on delete type
            if (response.data.deletedPermanently) {
                success('Xóa sản phẩm thành công')
            } else {
                success(`Sản phẩm đã được ẩn: ${response.data.reason}`)
            }
        } catch (error) {
            console.error('Error deleting product:', error)
            showError('Có lỗi xảy ra khi xóa sản phẩm')
        }
    }

    const handleBulkDelete = async () => {
        if (selectedProducts.length === 0) return

        setIsBulkDeleting(true)
        try {
            const deletePromises = selectedProducts.map(id =>
                api.delete(`/seller/products/${id}?storeId=${currentStore?.id}`)
            )

            const responses = await Promise.all(deletePromises)

            // Count permanent vs soft deletes
            let permanentDeletes = 0
            let softDeletes = 0

            responses.forEach(response => {
                if (response.data.deletedPermanently) {
                    permanentDeletes++
                } else {
                    softDeletes++
                }
            })

            setProducts(products.filter(product => !selectedProducts.includes(product.id)))
            setSelectedProducts([])

            // Show appropriate message
            if (permanentDeletes > 0 && softDeletes > 0) {
                success(`Đã xóa ${permanentDeletes} sản phẩm và ẩn ${softDeletes} sản phẩm`)
            } else if (permanentDeletes > 0) {
                success(`Đã xóa ${permanentDeletes} sản phẩm thành công`)
            } else {
                success(`Đã ẩn ${softDeletes} sản phẩm`)
            }
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

    // Remove resetFilters function as it's no longer needed

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
        link.setAttribute('download', `products_${format(new Date(), 'yyyy-MM-dd')}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const getStatusColor = (status: ProductStatus) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-800'
            case 'DRAFT':
                return 'bg-gray-100 text-gray-800'
            case 'PENDING_APPROVAL':
                return 'bg-yellow-100 text-yellow-800'
            case 'INACTIVE':
                return 'bg-red-100 text-red-800'
            case 'OUT_OF_STOCK':
                return 'bg-orange-100 text-orange-800'
            case 'DISCONTINUED':
                return 'bg-purple-100 text-purple-800'
            case 'REJECTED':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
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

    // Filter products (không sort thủ công nữa)
    const filteredProducts = products
        .filter(product => {
            const matchesSearch = !searchTerm ||
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))

            const matchesStatus = activeFilters.status === 'ALL' || product.status === activeFilters.status

            const matchesStock = activeFilters.stock === 'ALL' ||
                (activeFilters.stock === 'IN_STOCK' && product.stock > 0) ||
                (activeFilters.stock === 'OUT_OF_STOCK' && product.stock === 0) ||
                (activeFilters.stock === 'LOW_STOCK' && product.stock > 0 && product.stock <= 10)

            return matchesSearch && matchesStatus && matchesStock
        })

    const columns: ColumnDef<Product>[] = [
        {
            id: 'select',
            header: () => (
                <Checkbox
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
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
            accessorKey: 'images',
            header: 'Ảnh',
            cell: ({ row }) => {
                const images = row.original.images
                return (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                        {images && images.length > 0 ? (
                            <Image
                                src={images[0]}
                                alt={row.original.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-xs text-gray-500">No img</span>
                            </div>
                        )}
                    </div>
                )
            },
        },
        {
            accessorKey: 'name',
            header: 'Tên sản phẩm',
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
            accessorKey: 'category',
            header: 'Danh mục',
            cell: ({ row }) => row.original.category?.name || "-",
        },
        {
            accessorKey: 'price',
            header: 'Giá',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">
                        {typeof row.original.originalPrice === 'number'
                            ? row.original.originalPrice.toLocaleString('vi-VN') + 'đ'
                            : '—'}
                    </span>
                    {row.original.salePrice && (
                        <span className="text-sm text-red-500 line-through">
                            {typeof row.original.salePrice === 'number'
                                ? row.original.salePrice.toLocaleString('vi-VN') + 'đ'
                                : '—'}
                        </span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'stock',
            header: 'Tồn kho',
            cell: ({ row }) => (
                <Badge variant={row.original.stock > 0 ? "default" : "destructive"}>
                    {row.original.stock}
                </Badge>
            ),
        },
        {
            accessorKey: 'purchaseCount',
            header: 'Đã bán',
            cell: ({ row }) => row.original.purchaseCount,
        },
        {
            accessorKey: 'status',
            header: 'Trạng thái',
            cell: ({ row }) => (
                <Badge className={getStatusColor(row.original.status)}>
                    {getStatusText(row.original.status)}
                </Badge>
            ),
        },
        {
            accessorKey: 'updatedAt',
            header: 'Cập nhật',
            cell: ({ row }) => format(new Date(row.original.updatedAt), 'dd/MM/yyyy', { locale: vi }),
        },
        {
            id: 'actions',
            header: 'Thao tác',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/seller/products/${row.original.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Xem chi tiết
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/seller/products/${row.original.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleDelete(row.original.id)}
                            className="text-red-600"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    // Handle search change
    const handleSearchChange = (value: string) => {
        setSearchTerm(value)
    }

    // Handle filter change
    const handleFilterChange = (key: string, value: string) => {
        setActiveFilters(prev => ({
            ...prev,
            [key]: value
        }))
    }

    // Handle clear filters
    const handleClearFilters = () => {
        setActiveFilters({
            status: 'ALL',
            stock: 'ALL'
        })
    }

    // Handle export
    const handleExport = () => {
        handleExportCSV()
    }

    // Handle refresh
    const handleRefresh = () => {
        // Refetch products
        const fetchProducts = async () => {
            if (!currentStore) return

            try {
                const response = await api.get(`/seller/products?storeId=${currentStore.id}`)
                setProducts(response.data.products || [])
            } catch (error) {
                console.error('Error fetching products:', error)
                showError('Không thể tải danh sách sản phẩm')
            }
        }

        fetchProducts()
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Sản phẩm</h1>
                            <p className="text-muted-foreground">
                                Quản lý sản phẩm của cửa hàng
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" asChild>
                                <Link href="/seller/products/trash">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Sản phẩm đã ẩn
                                </Link>
                            </Button>
                            {selectedProducts.length > 0 && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" disabled={isBulkDeleting}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Xóa ({selectedProducts.length})
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Bạn có chắc chắn muốn xóa {selectedProducts.length} sản phẩm đã chọn?
                                                Hành động này không thể hoàn tác.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleBulkDelete}>
                                                Xóa
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                            <Button asChild>
                                <Link href="/seller/products/new">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Thêm sản phẩm
                                </Link>
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                        searchPlaceholder="Tìm kiếm sản phẩm..."
                        isLoading={isLoading}
                        emptyMessage="Không có sản phẩm nào."
                        filters={filters}
                        activeFilters={activeFilters}
                        onFilterChange={handleFilterChange}
                        onClearFilters={handleClearFilters}
                        onSearchChange={handleSearchChange}
                        onExport={handleExport}
                        onRefresh={handleRefresh}
                        showToolbar={true}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default ProductsList 