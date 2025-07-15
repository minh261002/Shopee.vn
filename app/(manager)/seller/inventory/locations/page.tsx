"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/dataTables/data-table'
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    MoreHorizontal,
    MapPin,
    Package,
    TrendingUp,
    TrendingDown
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { api } from '@/lib/axios'
import { useStore } from '@/providers/store-context'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
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
import { FilterOption } from '@/components/dataTables/data-table-toolbar'

interface InventoryLocation {
    id: string
    name: string
    code: string
    address: string
    lat?: number
    lng?: number
    isActive: boolean
    isDefault: boolean
    createdAt: string
    updatedAt: string
    _count?: {
        inventoryItems: number
        stockMovements: number
    }
}

const LocationsPage = () => {
    const { success, error: showError } = useToast()
    const [locations, setLocations] = useState<InventoryLocation[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
        status: 'ALL',
        default: 'ALL'
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
                { value: 'ACTIVE', label: 'Hoạt động' },
                { value: 'INACTIVE', label: 'Không hoạt động' }
            ]
        },
        {
            key: 'default',
            label: 'Kho mặc định',
            type: 'select',
            placeholder: 'Chọn loại',
            options: [
                { value: 'DEFAULT', label: 'Kho mặc định' },
                { value: 'NOT_DEFAULT', label: 'Không phải mặc định' }
            ]
        }
    ]

    useEffect(() => {
        const fetchLocations = async () => {
            if (!currentStore) {
                setIsLoading(false)
                return
            }

            try {
                const response = await api.get(`/seller/inventory/locations?storeId=${currentStore.id}`)
                setLocations(response.data.locations || [])
            } catch (error) {
                console.error('Error fetching locations:', error)
                showError('Không thể tải danh sách kho')
            } finally {
                setIsLoading(false)
            }
        }

        fetchLocations()
    }, [showError, currentStore])

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
            default: 'ALL'
        })
    }

    // Handle export
    const handleExport = () => {
        showError('Tính năng xuất dữ liệu đang được phát triển')
    }

    // Handle refresh
    const handleRefresh = () => {
        if (currentStore) {
            const fetchLocations = async () => {
                try {
                    setIsLoading(true)
                    const response = await api.get(`/seller/inventory/locations?storeId=${currentStore.id}`)
                    setLocations(response.data.locations || [])
                } catch (error) {
                    console.error('Error fetching locations:', error)
                    showError('Không thể tải danh sách kho')
                } finally {
                    setIsLoading(false)
                }
            }
            fetchLocations()
        }
    }

    const handleDeleteLocation = async (locationId: string) => {
        try {
            await api.delete(`/seller/inventory/locations/${locationId}?storeId=${currentStore?.id}`)
            setLocations(locations.filter(location => location.id !== locationId))
            success('Xóa vị trí kho thành công')
        } catch (error) {
            console.error('Error deleting location:', error)
            showError('Có lỗi xảy ra khi xóa vị trí kho')
        }
    }

    const handleToggleActive = async (locationId: string, isActive: boolean) => {
        try {
            await api.patch(`/seller/inventory/locations/${locationId}?storeId=${currentStore?.id}`, {
                isActive: !isActive
            })
            setLocations(locations.map(location =>
                location.id === locationId
                    ? { ...location, isActive: !isActive }
                    : location
            ))
            success(`Đã ${!isActive ? 'kích hoạt' : 'vô hiệu hóa'} kho`)
        } catch (error) {
            console.error('Error toggling location status:', error)
            showError('Có lỗi xảy ra khi thay đổi trạng thái kho')
        }
    }

    const handleSetDefault = async (locationId: string) => {
        try {
            await api.patch(`/seller/inventory/locations/${locationId}/default?storeId=${currentStore?.id}`)
            setLocations(locations.map(location => ({
                ...location,
                isDefault: location.id === locationId
            })))
            success('Đã đặt làm kho mặc định')
        } catch (error) {
            console.error('Error setting default location:', error)
            showError('Có lỗi xảy ra khi đặt kho mặc định')
        }
    }

    const columns: ColumnDef<InventoryLocation>[] = [
        {
            accessorKey: 'name',
            header: 'Tên kho',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.name}</div>
                    <div className="text-sm text-muted-foreground">{row.original.code}</div>
                </div>
            ),
        },
        {
            accessorKey: 'address',
            header: 'Địa chỉ',
            cell: ({ row }) => (
                <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{row.original.address}</span>
                </div>
            ),
        },
        {
            accessorKey: 'isDefault',
            header: 'Mặc định',
            cell: ({ row }) => (
                <Badge variant={row.original.isDefault ? 'default' : 'secondary'}>
                    {row.original.isDefault ? 'Có' : 'Không'}
                </Badge>
            ),
        },
        {
            accessorKey: 'isActive',
            header: 'Trạng thái',
            cell: ({ row }) => (
                <Badge variant={row.original.isActive ? 'default' : 'destructive'}>
                    {row.original.isActive ? 'Hoạt động' : 'Không hoạt động'}
                </Badge>
            ),
        },
        {
            accessorKey: '_count',
            header: 'Sản phẩm',
            cell: ({ row }) => (
                <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>{row.original._count?.inventoryItems || 0}</span>
                </div>
            ),
        },
        {
            accessorKey: 'movements',
            header: 'Giao dịch',
            cell: ({ row }) => (
                <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>{row.original._count?.stockMovements || 0}</span>
                </div>
            ),
        },
        {
            accessorKey: 'createdAt',
            header: 'Tạo lúc',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {format(new Date(row.original.createdAt), 'dd/MM/yyyy', { locale: vi })}
                </span>
            ),
        },
        {
            id: 'actions',
            header: 'Thao tác',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/seller/inventory/locations/${row.original.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Xem chi tiết
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/seller/inventory/locations/${row.original.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                            </Link>
                        </DropdownMenuItem>
                        {!row.original.isDefault && (
                            <DropdownMenuItem onClick={() => handleSetDefault(row.original.id)}>
                                <MapPin className="mr-2 h-4 w-4" />
                                Đặt làm mặc định
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleToggleActive(row.original.id, row.original.isActive)}>
                            {row.original.isActive ? (
                                <>
                                    <TrendingDown className="mr-2 h-4 w-4" />
                                    Vô hiệu hóa
                                </>
                            ) : (
                                <>
                                    <TrendingUp className="mr-2 h-4 w-4" />
                                    Kích hoạt
                                </>
                            )}
                        </DropdownMenuItem>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Xóa
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Bạn có chắc chắn muốn xóa vị trí kho &quot;{row.original.name}&quot;?
                                        Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteLocation(row.original.id)}>
                                        Xóa
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý vị trí kho</h1>
                    <p className="text-muted-foreground">
                        Quản lý các vị trí kho hàng của bạn
                    </p>
                </div>
                <Button asChild>
                    <Link href="/seller/inventory/locations/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm kho mới
                    </Link>
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng kho</CardTitle>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{locations.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Vị trí kho đã tạo
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Kho hoạt động</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {locations.filter(l => l.isActive).length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Kho đang hoạt động
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {locations.reduce((sum, location) => sum + (location._count?.inventoryItems || 0), 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Sản phẩm trong tất cả kho
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Locations Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách kho</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={locations}
                        searchKey="name"
                        searchPlaceholder="Tìm kiếm kho..."
                        isLoading={isLoading}
                        emptyMessage="Không có kho nào."
                        filters={filters}
                        activeFilters={activeFilters}
                        onFilterChange={handleFilterChange}
                        onClearFilters={handleClearFilters}
                        onExport={handleExport}
                        onRefresh={handleRefresh}
                        showToolbar={true}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default LocationsPage 