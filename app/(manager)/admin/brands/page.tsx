"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/dataTables/data-table'
import { Plus, Search, Edit, Trash2, Eye, MoreHorizontal, Tag } from 'lucide-react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
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
}

const BrandsList = () => {
    const { success, error: showError } = useToast()
    const [brands, setBrands] = useState<Brand[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeFilter, setActiveFilter] = useState<string>('all')
    const [featuredFilter, setFeaturedFilter] = useState<string>('all')

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const params = new URLSearchParams()
                if (searchTerm) params.append('search', searchTerm)
                if (activeFilter !== 'all') params.append('isActive', activeFilter)
                if (featuredFilter !== 'all') params.append('isFeatured', featuredFilter)

                const response = await api.get(`/admin/brands?${params.toString()}`)
                setBrands(response.data.brands || [])
            } catch (error) {
                console.error('Error fetching brands:', error)
                showError('Không thể tải danh sách thương hiệu')
            } finally {
                setIsLoading(false)
            }
        }

        fetchBrands()
    }, [searchTerm, activeFilter, featuredFilter, showError])

    const handleDelete = async (brandId: string) => {
        try {
            await api.delete(`/admin/brands/${brandId}`)
            setBrands(brands.filter(brand => brand.id !== brandId))
            success('Xóa thương hiệu thành công')
        } catch (error) {
            console.error('Error deleting brand:', error)
            showError('Có lỗi xảy ra khi xóa thương hiệu')
        }
    }

    const columns: ColumnDef<Brand>[] = [
        {
            accessorKey: 'logo',
            header: 'Logo',
            cell: ({ row }) => {
                const brand = row.original
                return (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        {brand.logo ? (
                            <Image
                                src={brand.logo}
                                alt={brand.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <Tag className="w-6 h-6 text-gray-400" />
                        )}
                    </div>
                )
            },
        },
        {
            accessorKey: 'name',
            header: 'Thương hiệu',
            cell: ({ row }) => {
                const brand = row.original
                return (
                    <div className="space-y-1">
                        <p className="font-medium">{brand.name}</p>
                        <p className="text-sm text-muted-foreground">
                            {brand.slug}
                        </p>
                        {brand.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {brand.description}
                            </p>
                        )}
                    </div>
                )
            },
        },
        {
            accessorKey: 'products',
            header: 'Sản phẩm',
            cell: ({ row }) => {
                const brand = row.original
                return (
                    <div className="text-center">
                        <p className="font-medium">{brand._count.products}</p>
                        <p className="text-sm text-muted-foreground">sản phẩm</p>
                    </div>
                )
            },
        },
        {
            accessorKey: 'status',
            header: 'Trạng thái',
            cell: ({ row }) => {
                const brand = row.original
                return (
                    <div className="space-y-1">
                        <Badge variant={brand.isActive ? 'default' : 'secondary'}>
                            {brand.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        </Badge>
                        {brand.isFeatured && (
                            <Badge variant="outline" className="block w-fit">
                                Nổi bật
                            </Badge>
                        )}
                    </div>
                )
            },
        },
        {
            accessorKey: 'website',
            header: 'Website',
            cell: ({ row }) => {
                const brand = row.original
                return brand.website ? (
                    <a
                        href={brand.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                    >
                        Xem website
                    </a>
                ) : (
                    <span className="text-muted-foreground text-sm">-</span>
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
                        {format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </p>
                )
            },
        },
        {
            id: 'actions',
            header: 'Hành động',
            cell: ({ row }) => {
                const brand = row.original
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
                                <Link href={`/admin/brands/${brand.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Xem chi tiết
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/brands/${brand.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Chỉnh sửa
                                </Link>
                            </DropdownMenuItem>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                                        <span className="text-red-600">Xóa</span>
                                    </DropdownMenuItem>
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
                                            onClick={() => handleDelete(brand.id)}
                                            className="bg-red-600 hover:bg-red-700"
                                            disabled={brand._count.products > 0}
                                        >
                                            Xóa thương hiệu
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

    const filteredBrands = brands.filter(brand => {
        const matchesSearch = brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            brand.description?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesSearch
    })

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Tag className="w-5 h-5" />
                            <CardTitle>Quản lý thương hiệu</CardTitle>
                        </div>
                        <Button asChild>
                            <Link href="/admin/brands/new">
                                <Plus className="w-4 h-4 mr-2" />
                                Thêm thương hiệu
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Filters */}
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Tìm kiếm thương hiệu..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select value={activeFilter} onValueChange={setActiveFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="true">Hoạt động</SelectItem>
                                <SelectItem value="false">Không hoạt động</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Nổi bật" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="true">Nổi bật</SelectItem>
                                <SelectItem value="false">Thường</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-secondary/10 rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground">Tổng thương hiệu</p>
                            <p className="text-2xl font-bold">{brands.length}</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground">Hoạt động</p>
                            <p className="text-2xl font-bold text-green-600">
                                {brands.filter(b => b.isActive).length}
                            </p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground">Nổi bật</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {brands.filter(b => b.isFeatured).length}
                            </p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground">Sản phẩm</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {brands.reduce((total, b) => total + b._count.products, 0)}
                            </p>
                        </div>
                    </div>

                    {/* Data Table */}
                    <DataTable
                        columns={columns}
                        data={filteredBrands}
                        searchKey="name"
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default BrandsList 