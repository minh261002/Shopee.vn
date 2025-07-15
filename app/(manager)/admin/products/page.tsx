"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/dataTables/data-table'
import { Package, Search, Eye, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ColumnDef } from '@tanstack/react-table'
import Image from 'next/image'
import { api } from '@/lib/axios'
import { useToast } from '@/hooks/use-toast'
import { ProductStatus } from '@prisma/client'
import { useSearchParams } from 'next/navigation'

interface Product {
    id: string
    name: string
    slug: string
    sku?: string
    originalPrice: number
    salePrice?: number
    stock: number
    status: ProductStatus
    images: string[]
    category?: {
        id: string
        name: string
    }
    store: {
        id: string
        name: string
        owner: {
            name: string
            email: string
        }
    }
    createdAt: string
    updatedAt: string
}

const AdminProductsPage = () => {
    const { success, error: showError } = useToast()
    const searchParams = useSearchParams()
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<ProductStatus | 'ALL'>('ALL')
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    })

    // Initialize status filter from URL params
    useEffect(() => {
        const statusParam = searchParams.get('status')
        if (statusParam && statusParam !== 'ALL') {
            setStatusFilter(statusParam as ProductStatus)
        }
    }, [searchParams])

    useEffect(() => {
        fetchProducts()
    }, [statusFilter, pagination.page])

    const fetchProducts = async () => {
        try {
            setIsLoading(true)
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...(statusFilter !== 'ALL' && { status: statusFilter }),
                ...(searchTerm && { search: searchTerm }),
            })

            const response = await api.get(`/admin/products?${params.toString()}`)
            setProducts(response.data.products || [])
            setPagination(response.data.pagination || pagination)
        } catch (error) {
            console.error('Error fetching products:', error)
            showError('Không thể tải danh sách sản phẩm')
        } finally {
            setIsLoading(false)
        }
    }

    const handleApprove = async (productId: string) => {
        try {
            await api.put(`/admin/products/${productId}/approve`)
            success('Phê duyệt sản phẩm thành công')
            fetchProducts()
        } catch (error) {
            console.error('Error approving product:', error)
            showError('Có lỗi xảy ra khi phê duyệt sản phẩm')
        }
    }

    const handleReject = async (productId: string) => {
        try {
            await api.put(`/admin/products/${productId}/reject`)
            success('Từ chối sản phẩm thành công')
            fetchProducts()
        } catch (error) {
            console.error('Error rejecting product:', error)
            showError('Có lỗi xảy ra khi từ chối sản phẩm')
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

    const columns: ColumnDef<Product>[] = [
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
            accessorKey: "store",
            header: "Cửa hàng",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.store.name}</span>
                    <span className="text-sm text-gray-500">{row.original.store.owner.name}</span>
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
            accessorKey: "stock",
            header: "Tồn kho",
            cell: ({ row }) => (
                <Badge variant={row.original.stock > 0 ? "default" : "destructive"}>
                    {row.original.stock}
                </Badge>
            ),
        },
        {
            accessorKey: "status",
            header: "Trạng thái",
            cell: ({ row }) => getStatusBadge(row.getValue("status")),
        },
        {
            accessorKey: "createdAt",
            header: "Ngày tạo",
            cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString('vi-VN'),
        },
        {
            id: "actions",
            header: "Thao tác",
            cell: ({ row }) => {
                const product = row.original
                const actions = [
                    {
                        label: "Xem chi tiết",
                        icon: Eye,
                        onClick: () => {
                            const url = `/seller/products/${product.id}`
                            window.open(url, '_blank')
                        },
                    },
                ]

                // Add approval actions for pending products
                if (product.status === 'PENDING_APPROVAL') {
                    actions.push(
                        {
                            label: "Phê duyệt",
                            icon: CheckCircle,
                            onClick: () => handleApprove(product.id),
                        },
                        {
                            label: "Từ chối",
                            icon: XCircle,
                            onClick: () => handleReject(product.id),
                        }
                    )
                }

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {actions.map((action, index) => (
                                <DropdownMenuItem
                                    key={index}
                                    onClick={action.onClick}
                                    className={action.label === "Từ chối" ? "text-red-600" : ""}
                                >
                                    <action.icon className="mr-2 h-4 w-4" />
                                    {action.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.store.name.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'ALL' || product.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const pendingProducts = products.filter(p => p.status === 'PENDING_APPROVAL').length
    const activeProducts = products.filter(p => p.status === 'ACTIVE').length
    const totalProducts = products.length

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Quản lý sản phẩm</h1>
                    <p className="text-muted-foreground">
                        Duyệt và quản lý sản phẩm từ các cửa hàng
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalProducts}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
                        <Package className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{pendingProducts}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đang bán</CardTitle>
                        <Package className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{activeProducts}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4" />
                    <Input
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as ProductStatus | 'ALL')}
                    className="border border-input bg-background px-3 py-2 text-sm rounded-md"
                >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="PENDING_APPROVAL">Chờ duyệt</option>
                    <option value="ACTIVE">Đang bán</option>
                    <option value="DRAFT">Bản nháp</option>
                    <option value="INACTIVE">Đã ẩn</option>
                </select>
            </div>

            {/* Data Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách sản phẩm</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <Package className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Đang tải...</h3>
                            </div>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-8">
                            <Package className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                {searchTerm ? 'Không tìm thấy sản phẩm' : 'Không có sản phẩm nào'}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Các sản phẩm sẽ xuất hiện ở đây'}
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

export default AdminProductsPage 