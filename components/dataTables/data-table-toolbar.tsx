"use client"

import React, { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
    Search,
    Filter,
    X,
    Download,
    RefreshCw,
    SlidersHorizontal
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'

export interface FilterOption {
    key: string
    label: string
    type: 'select' | 'date' | 'range' | 'checkbox'
    options?: { value: string; label: string }[]
    placeholder?: string
}

export interface DataTableToolbarProps {
    // Search
    searchValue?: string
    onSearchChange?: (value: string) => void
    searchPlaceholder?: string
    showSearch?: boolean

    // Filters
    filters?: FilterOption[]
    activeFilters?: Record<string, string>
    onFilterChange?: (key: string, value: string) => void
    onClearFilters?: () => void
    showFilters?: boolean

    // Actions
    onExport?: () => void
    onRefresh?: () => void
    showExport?: boolean
    showRefresh?: boolean

    // Column visibility
    columns?: { id: string; label: string }[]
    visibleColumns?: string[]
    onColumnVisibilityChange?: (columnId: string, visible: boolean) => void
    showColumnToggle?: boolean

    // Mobile responsive
    isMobile?: boolean
    className?: string
}

export function DataTableToolbar({
    searchValue = '',
    onSearchChange,
    searchPlaceholder = 'Tìm kiếm...',
    showSearch = true,
    filters = [],
    activeFilters = {},
    onFilterChange,
    onClearFilters,
    showFilters = true,
    onExport,
    onRefresh,
    showExport = true,
    showRefresh = true,
    columns = [],
    visibleColumns = [],
    onColumnVisibilityChange,
    showColumnToggle = true,
    isMobile = false,
    className = '',
}: DataTableToolbarProps) {
    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)

    const activeFilterCount = useMemo(() => {
        return Object.values(activeFilters).filter(value => value && value !== 'ALL').length
    }, [activeFilters])

    const hasActiveFilters = activeFilterCount > 0

    const handleFilterChange = (key: string, value: string) => {
        onFilterChange?.(key, value)
    }

    const handleClearFilters = () => {
        onClearFilters?.()
        setIsFilterSheetOpen(false)
    }

    const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
        onColumnVisibilityChange?.(columnId, visible)
    }

    // Mobile view
    if (isMobile) {
        return (
            <div className={`space-y-4 ${className}`}>
                {/* Search */}
                {showSearch && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={searchValue}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        {showFilters && (
                            <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Filter className="h-4 w-4 mr-2" />
                                        Bộ lọc
                                        {hasActiveFilters && (
                                            <Badge variant="secondary" className="ml-2">
                                                {activeFilterCount}
                                            </Badge>
                                        )}
                                    </Button>
                                </SheetTrigger>
                                <SheetContent>
                                    <SheetHeader>
                                        <SheetTitle>Bộ lọc</SheetTitle>
                                        <SheetDescription>
                                            Chọn các bộ lọc để tìm kiếm dữ liệu
                                        </SheetDescription>
                                    </SheetHeader>
                                    <div className="space-y-4 mt-6">
                                        {filters.map((filter) => (
                                            <div key={filter.key} className="space-y-2">
                                                <label className="text-sm font-medium">
                                                    {filter.label}
                                                </label>
                                                <Select
                                                    value={activeFilters[filter.key] || 'ALL'}
                                                    onValueChange={(value) => handleFilterChange(filter.key, value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={filter.placeholder} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="ALL">Tất cả</SelectItem>
                                                        {filter.options?.map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        ))}
                                        <div className="flex items-center space-x-2 pt-4">
                                            <Button variant="outline" onClick={handleClearFilters} className="flex-1">
                                                <X className="h-4 w-4 mr-2" />
                                                Xóa bộ lọc
                                            </Button>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        )}

                        {showColumnToggle && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                                        Cột
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {columns.map((column) => (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            checked={visibleColumns.includes(column.id)}
                                            onCheckedChange={(checked) =>
                                                handleColumnVisibilityChange(column.id, checked)
                                            }
                                        >
                                            {column.label}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        {showRefresh && (
                            <Button variant="outline" size="sm" onClick={onRefresh}>
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        )}
                        {showExport && (
                            <Button variant="outline" size="sm" onClick={onExport}>
                                <Download className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Active filters display */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(activeFilters).map(([key, value]) => {
                            if (!value || value === 'ALL') return null
                            const filter = filters.find(f => f.key === key)
                            const option = filter?.options?.find(o => o.value === value)
                            return (
                                <Badge key={key} variant="secondary" className="gap-1">
                                    {filter?.label}: {option?.label || value}
                                    <button
                                        onClick={() => handleFilterChange(key, 'ALL')}
                                        className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )
                        })}
                    </div>
                )}
            </div>
        )
    }

    // Desktop view
    return (
        <Card className={`${className} p-0 border-0 shadow-none`}>
            <CardContent className='px-0 shadow-none'>
                <div className="flex items-center justify-between space-x-2">
                    {/* Search */}
                    {showSearch && (
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={searchPlaceholder}
                                value={searchValue}
                                onChange={(e) => onSearchChange?.(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    )}

                    {/* Filters */}
                    {showFilters && filters.length > 0 && (
                        <div className="flex items-center space-x-2">
                            {filters.map((filter) => (
                                <Select
                                    key={filter.key}
                                    value={activeFilters[filter.key] || 'ALL'}
                                    onValueChange={(value) => handleFilterChange(filter.key, value)}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder={filter.placeholder} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Tất cả {filter.label}</SelectItem>
                                        {filter.options?.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                        {hasActiveFilters && (
                            <Button variant="outline" size="sm" onClick={handleClearFilters}>
                                <X className="h-4 w-4 mr-2" />
                                Xóa bộ lọc
                            </Button>
                        )}

                        {showColumnToggle && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                                        Cột
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {columns.map((column) => (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            checked={visibleColumns.includes(column.id)}
                                            onCheckedChange={(checked) =>
                                                handleColumnVisibilityChange(column.id, checked)
                                            }
                                        >
                                            {column.label}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        {showRefresh && (
                            <Button variant="outline" size="sm" onClick={onRefresh}>
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        )}

                        {showExport && (
                            <Button variant="outline" size="sm" onClick={onExport}>
                                <Download className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Active filters display */}
                {hasActiveFilters && (
                    <>
                        <Separator className="my-4" />
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(activeFilters).map(([key, value]) => {
                                if (!value || value === 'ALL') return null
                                const filter = filters.find(f => f.key === key)
                                const option = filter?.options?.find(o => o.value === value)
                                return (
                                    <Badge key={key} variant="secondary" className="gap-1">
                                        {filter?.label}: {option?.label || value}
                                        <button
                                            onClick={() => handleFilterChange(key, 'ALL')}
                                            className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )
                            })}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
} 