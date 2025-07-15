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
    Download,
    Package,
    AlertTriangle,
    Warehouse,
    BarChart3
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
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FilterOption } from '@/components/dataTables/data-table-toolbar'

// Types
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

interface InventoryItem {
    id: string
    locationId: string
    location: {
        name: string
        code: string
    }
    productId?: string
    product?: {
        id: string
        name: string
        sku?: string
        images: string[]
    }
    variantId?: string
    variant?: {
        id: string
        name: string
        sku?: string
    }
    quantity: number
    reservedQty: number
    availableQty: number
    minStockLevel: number
    maxStockLevel?: number
    reorderPoint: number
    avgCostPrice?: number
    lastCostPrice?: number
    updatedAt: string
}

interface StockMovement {
    id: string
    locationId: string
    location: {
        name: string
        code: string
    }
    productId?: string
    product?: {
        name: string
        sku?: string
    }
    variantId?: string
    variant?: {
        name: string
        sku?: string
    }
    type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT' | 'RETURN' | 'DAMAGED' | 'EXPIRED'
    quantity: number
    unitCost?: number
    totalCost?: number
    reason?: string
    referenceNumber?: string
    createdBy?: string
    createdAt: string
    orderId?: string
    transferToLocationId?: string
    transferToLocation?: {
        name: string
        code: string
    }
}

interface InventoryStats {
    totalLocations: number
    totalProducts: number
    totalValue: number
    lowStockItems: number
    outOfStockItems: number
    recentMovements: number
}

const InventoryManagement = () => {
    const { success, error: showError } = useToast()
    const [locations, setLocations] = useState<InventoryLocation[]>([])
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
    const [stockMovements, setStockMovements] = useState<StockMovement[]>([])
    const [stats, setStats] = useState<InventoryStats>({
        totalLocations: 0,
        totalProducts: 0,
        totalValue: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        recentMovements: 0
    })
    const [isLoading, setIsLoading] = useState(true)
    const [selectedItems, setSelectedItems] = useState<string[]>([])
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
        location: 'ALL',
        stock: 'ALL',
        movementType: 'ALL'
    })
    const { currentStore } = useStore()

    // Define filters for items
    const itemFilters: FilterOption[] = [
        {
            key: 'location',
            label: 'Kho',
            type: 'select',
            placeholder: 'Chọn kho',
            options: [
                { value: 'ALL', label: 'Tất cả kho' },
                ...locations.map(location => ({
                    value: location.id,
                    label: location.name
                }))
            ]
        },
        {
            key: 'stock',
            label: 'Trạng thái tồn kho',
            type: 'select',
            placeholder: 'Chọn trạng thái',
            options: [
                { value: 'ALL', label: 'Tất cả trạng thái' },
                { value: 'IN_STOCK', label: 'Còn hàng' },
                { value: 'LOW_STOCK', label: 'Sắp hết' },
                { value: 'OUT_OF_STOCK', label: 'Hết hàng' }
            ]
        }
    ]

    // Define filters for movements
    const movementFilters: FilterOption[] = [
        {
            key: 'movementType',
            label: 'Loại giao dịch',
            type: 'select',
            placeholder: 'Chọn loại',
            options: [
                { value: 'ALL', label: 'Tất cả loại' },
                { value: 'IN', label: 'Nhập kho' },
                { value: 'OUT', label: 'Xuất kho' },
                { value: 'TRANSFER', label: 'Chuyển kho' },
                { value: 'ADJUSTMENT', label: 'Điều chỉnh' },
                { value: 'RETURN', label: 'Trả hàng' },
                { value: 'DAMAGED', label: 'Hư hỏng' },
                { value: 'EXPIRED', label: 'Hết hạn' }
            ]
        }
    ]

    useEffect(() => {
        const fetchInventoryData = async () => {
            if (!currentStore) {
                setIsLoading(false)
                return
            }

            try {
                const [locationsRes, itemsRes, movementsRes, statsRes] = await Promise.all([
                    api.get(`/seller/inventory/locations?storeId=${currentStore.id}`),
                    api.get(`/seller/inventory/items?storeId=${currentStore.id}`),
                    api.get(`/seller/inventory/movements?storeId=${currentStore.id}&limit=50`),
                    api.get(`/seller/inventory/stats?storeId=${currentStore.id}`)
                ])

                setLocations(locationsRes.data.locations || [])
                setInventoryItems(itemsRes.data.items || [])
                setStockMovements(movementsRes.data.movements || [])
                setStats(statsRes.data.stats || {})
            } catch (error) {
                console.error('Error fetching inventory data:', error)
                showError('Không thể tải dữ liệu kho hàng')
            } finally {
                setIsLoading(false)
            }
        }

        fetchInventoryData()
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
            location: 'ALL',
            stock: 'ALL',
            movementType: 'ALL'
        })
    }

    // Handle export
    const handleExport = () => {
        showError('Tính năng xuất dữ liệu đang được phát triển')
    }

    // Handle refresh
    const handleRefresh = () => {
        if (currentStore) {
            const fetchInventoryData = async () => {
                try {
                    setIsLoading(true)
                    const [locationsRes, itemsRes, movementsRes, statsRes] = await Promise.all([
                        api.get(`/seller/inventory/locations?storeId=${currentStore.id}`),
                        api.get(`/seller/inventory/items?storeId=${currentStore.id}`),
                        api.get(`/seller/inventory/movements?storeId=${currentStore.id}&limit=50`),
                        api.get(`/seller/inventory/stats?storeId=${currentStore.id}`)
                    ])

                    setLocations(locationsRes.data.locations || [])
                    setInventoryItems(itemsRes.data.items || [])
                    setStockMovements(movementsRes.data.movements || [])
                    setStats(statsRes.data.stats || {})
                } catch (error) {
                    console.error('Error fetching inventory data:', error)
                    showError('Không thể tải dữ liệu kho hàng')
                } finally {
                    setIsLoading(false)
                }
            }
            fetchInventoryData()
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

    const handleSelectAll = (items: InventoryItem[]) => {
        if (selectedItems.length === items.length) {
            setSelectedItems([])
        } else {
            setSelectedItems(items.map(item => item.id))
        }
    }

    const handleSelectItem = (itemId: string) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        )
    }

    const resetFilters = () => {
        setSelectedItems([])
        handleClearFilters()
    }

    const getStockStatus = (item: InventoryItem) => {
        if (item.availableQty <= 0) return 'OUT_OF_STOCK'
        if (item.availableQty <= item.reorderPoint) return 'LOW_STOCK'
        return 'IN_STOCK'
    }

    const getStockStatusColor = (status: string) => {
        switch (status) {
            case 'IN_STOCK':
                return 'bg-green-100 text-green-800'
            case 'LOW_STOCK':
                return 'bg-yellow-100 text-yellow-800'
            case 'OUT_OF_STOCK':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getStockStatusText = (status: string) => {
        switch (status) {
            case 'IN_STOCK':
                return 'Còn hàng'
            case 'LOW_STOCK':
                return 'Sắp hết'
            case 'OUT_OF_STOCK':
                return 'Hết hàng'
            default:
                return status
        }
    }

    const getMovementTypeColor = (type: string) => {
        switch (type) {
            case 'IN':
                return 'bg-green-100 text-green-800'
            case 'OUT':
                return 'bg-red-100 text-red-800'
            case 'TRANSFER':
                return 'bg-blue-100 text-blue-800'
            case 'ADJUSTMENT':
                return 'bg-purple-100 text-purple-800'
            case 'RETURN':
                return 'bg-orange-100 text-orange-800'
            case 'DAMAGED':
                return 'bg-red-100 text-red-800'
            case 'EXPIRED':
                return 'bg-gray-100 text-gray-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getMovementTypeText = (type: string) => {
        switch (type) {
            case 'IN':
                return 'Nhập kho'
            case 'OUT':
                return 'Xuất kho'
            case 'TRANSFER':
                return 'Chuyển kho'
            case 'ADJUSTMENT':
                return 'Điều chỉnh'
            case 'RETURN':
                return 'Trả hàng'
            case 'DAMAGED':
                return 'Hư hỏng'
            case 'EXPIRED':
                return 'Hết hạn'
            default:
                return type
        }
    }

    // Item columns
    const itemColumns: ColumnDef<InventoryItem>[] = [
        {
            id: "select",
            header: () => (
                <Checkbox
                    checked={selectedItems.length === inventoryItems.length}
                    onCheckedChange={() => handleSelectAll(inventoryItems)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={selectedItems.includes(row.original.id)}
                    onCheckedChange={() => handleSelectItem(row.original.id)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "product",
            header: "Sản phẩm",
            cell: ({ row }) => {
                const item = row.original
                return (
                    <div className="flex items-center space-x-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted">
                            {item.product?.images && item.product.images.length > 0 ? (
                                <img
                                    src={item.product.images[0]}
                                    alt={item.product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-5 h-5 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="font-medium">{item.product?.name || 'Sản phẩm không xác định'}</div>
                            <div className="text-sm text-muted-foreground">
                                {item.product?.sku || item.variant?.sku || 'Không có SKU'}
                            </div>
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: "location",
            header: "Kho",
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.location.name}</div>
                    <div className="text-sm text-muted-foreground">{row.original.location.code}</div>
                </div>
            ),
        },
        {
            accessorKey: "quantity",
            header: "Số lượng",
            cell: ({ row }) => (
                <div className="text-right">
                    <div className="font-medium">{row.original.quantity}</div>
                    <div className="text-sm text-muted-foreground">
                        Có sẵn: {row.original.availableQty}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "stockStatus",
            header: "Trạng thái",
            cell: ({ row }) => {
                const status = getStockStatus(row.original)
                return (
                    <Badge className={getStockStatusColor(status)}>
                        {getStockStatusText(status)}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "avgCostPrice",
            header: "Giá vốn",
            cell: ({ row }) => (
                <div className="text-right">
                    {row.original.avgCostPrice ? (
                        <div className="font-medium">
                            {row.original.avgCostPrice.toLocaleString('vi-VN')}đ
                        </div>
                    ) : (
                        <span className="text-muted-foreground">Chưa có</span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "updatedAt",
            header: "Cập nhật",
            cell: ({ row }) => (
                <div className="text-sm text-muted-foreground">
                    {format(new Date(row.original.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </div>
            ),
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
                        <DropdownMenuItem asChild>
                            <Link href={`/seller/inventory/items/${row.original.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Xem chi tiết
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/seller/inventory/items/${row.original.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    // Movement columns
    const movementColumns: ColumnDef<StockMovement>[] = [
        {
            accessorKey: "product",
            header: "Sản phẩm",
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.product?.name || 'Sản phẩm không xác định'}</div>
                    <div className="text-sm text-muted-foreground">
                        {row.original.product?.sku || row.original.variant?.sku || 'Không có SKU'}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "type",
            header: "Loại",
            cell: ({ row }) => (
                <Badge className={getMovementTypeColor(row.original.type)}>
                    {getMovementTypeText(row.original.type)}
                </Badge>
            ),
        },
        {
            accessorKey: "quantity",
            header: "Số lượng",
            cell: ({ row }) => (
                <div className="text-right">
                    <div className="font-medium">{row.original.quantity}</div>
                    {row.original.unitCost && (
                        <div className="text-sm text-muted-foreground">
                            {row.original.unitCost.toLocaleString('vi-VN')}đ/đơn vị
                        </div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "location",
            header: "Kho",
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.location.name}</div>
                    <div className="text-sm text-muted-foreground">{row.original.location.code}</div>
                </div>
            ),
        },
        {
            accessorKey: "reason",
            header: "Lý do",
            cell: ({ row }) => (
                <div className="max-w-[200px] truncate">
                    {row.original.reason || '-'}
                </div>
            ),
        },
        {
            accessorKey: "createdAt",
            header: "Ngày tạo",
            cell: ({ row }) => (
                <div className="text-sm text-muted-foreground">
                    {format(new Date(row.original.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </div>
            ),
        },
    ]

    // Location columns
    const locationColumns: ColumnDef<InventoryLocation>[] = [
        {
            accessorKey: "name",
            header: "Tên kho",
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.name}</div>
                    <div className="text-sm text-muted-foreground">{row.original.code}</div>
                </div>
            ),
        },
        {
            accessorKey: "address",
            header: "Địa chỉ",
            cell: ({ row }) => (
                <div className="max-w-[300px] truncate">
                    {row.original.address}
                </div>
            ),
        },
        {
            accessorKey: "isActive",
            header: "Trạng thái",
            cell: ({ row }) => (
                <Badge variant={row.original.isActive ? "default" : "secondary"}>
                    {row.original.isActive ? "Hoạt động" : "Không hoạt động"}
                </Badge>
            ),
        },
        {
            accessorKey: "isDefault",
            header: "Mặc định",
            cell: ({ row }) => (
                <Badge variant={row.original.isDefault ? "default" : "outline"}>
                    {row.original.isDefault ? "Mặc định" : "Không"}
                </Badge>
            ),
        },
        {
            accessorKey: "_count",
            header: "Thống kê",
            cell: ({ row }) => (
                <div className="text-sm">
                    <div>Sản phẩm: {row.original._count?.inventoryItems || 0}</div>
                    <div>Giao dịch: {row.original._count?.stockMovements || 0}</div>
                </div>
            ),
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
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Xóa
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Xác nhận xóa kho</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Bạn có chắc chắn muốn xóa kho &quot;{row.original.name}&quot;? Hành động này không thể hoàn tác.
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý kho hàng</h1>
                    <p className="text-muted-foreground">
                        Quản lý tồn kho, nhập xuất và vị trí kho hàng
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={resetFilters}>
                        Đặt lại
                    </Button>
                    {selectedItems.length > 0 && (
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Xuất ({selectedItems.length})
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng kho</CardTitle>
                        <Warehouse className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalLocations}</div>
                        <p className="text-xs text-muted-foreground">
                            Vị trí kho đang hoạt động
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalProducts}</div>
                        <p className="text-xs text-muted-foreground">
                            Sản phẩm trong kho
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Giá trị kho</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.totalValue.toLocaleString('vi-VN')}đ
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Tổng giá trị tồn kho
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cần chú ý</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {stats.lowStockItems + stats.outOfStockItems}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Sản phẩm sắp hết/hết hàng
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="items" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="items">Tồn kho</TabsTrigger>
                    <TabsTrigger value="movements">Lịch sử nhập/xuất</TabsTrigger>
                    <TabsTrigger value="locations">Vị trí kho</TabsTrigger>
                </TabsList>

                <TabsContent value="items" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Tồn kho sản phẩm</CardTitle>
                                <div className="flex items-center space-x-2">
                                    <Button variant="outline" size="sm">
                                        <Download className="mr-2 h-4 w-4" />
                                        Xuất Excel
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                columns={itemColumns}
                                data={inventoryItems}
                                searchKey="product"
                                searchPlaceholder="Tìm kiếm sản phẩm..."
                                isLoading={isLoading}
                                emptyMessage="Không có sản phẩm nào trong kho."
                                filters={itemFilters}
                                activeFilters={activeFilters}
                                onFilterChange={handleFilterChange}
                                onClearFilters={handleClearFilters}
                                onExport={handleExport}
                                onRefresh={handleRefresh}
                                showToolbar={true}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="movements" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Lịch sử nhập/xuất kho</CardTitle>
                                <Button asChild>
                                    <Link href="/seller/inventory/movements">
                                        <Eye className="mr-2 h-4 w-4" />
                                        Xem tất cả
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                columns={movementColumns}
                                data={stockMovements}
                                searchKey="product"
                                searchPlaceholder="Tìm kiếm giao dịch..."
                                isLoading={isLoading}
                                emptyMessage="Không có giao dịch nào."
                                filters={movementFilters}
                                activeFilters={activeFilters}
                                onFilterChange={handleFilterChange}
                                onClearFilters={handleClearFilters}
                                onExport={handleExport}
                                onRefresh={handleRefresh}
                                showToolbar={true}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="locations" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Vị trí kho</CardTitle>
                                <Button asChild>
                                    <Link href="/seller/inventory/locations/new">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Thêm kho mới
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                columns={locationColumns}
                                data={locations}
                                searchKey="name"
                                searchPlaceholder="Tìm kiếm kho..."
                                isLoading={isLoading}
                                emptyMessage="Không có kho nào."
                                onExport={handleExport}
                                onRefresh={handleRefresh}
                                showToolbar={true}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default InventoryManagement 