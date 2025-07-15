"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Settings2,
    Search
} from "lucide-react"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    searchKey?: keyof TData
    searchPlaceholder?: string
    isLoading?: boolean
    pageSize?: number
    showColumnToggle?: boolean
    showPagination?: boolean
    showSearch?: boolean
    emptyMessage?: string
    className?: string
    onPageChange?: (page: number) => void
    onPageSizeChange?: (pageSize: number) => void
    totalPages?: number
    currentPage?: number
    totalItems?: number
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    searchPlaceholder = "Tìm kiếm...",
    isLoading = false,
    pageSize = 10,
    showColumnToggle = true,
    showPagination = true,
    showSearch = true,
    emptyMessage = "Không có dữ liệu.",
    className,
    onPageChange,
    onPageSizeChange,
    totalPages,
    currentPage,
    totalItems,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        initialState: {
            pagination: {
                pageSize,
            },
        },
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    // Generate page numbers for pagination
    const generatePageNumbers = () => {
        if (!totalPages) return []

        const pages = []
        const maxVisiblePages = 5
        const current = currentPage || 1

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            if (current <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i)
                }
                pages.push('...')
                pages.push(totalPages)
            } else if (current >= totalPages - 2) {
                pages.push(1)
                pages.push('...')
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i)
                }
            } else {
                pages.push(1)
                pages.push('...')
                for (let i = current - 1; i <= current + 1; i++) {
                    pages.push(i)
                }
                pages.push('...')
                pages.push(totalPages)
            }
        }

        return pages
    }

    return (
        <div className={`space-y-4 ${className || ""}`}>
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <div className="flex flex-1 items-center space-x-2">
                    {showSearch && searchKey && (
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={searchPlaceholder}
                                value={(table.getColumn(searchKey as string)?.getFilterValue() as string) ?? ""}
                                onChange={(event) =>
                                    table.getColumn(searchKey as string)?.setFilterValue(event.target.value)
                                }
                                className="pl-8"
                            />
                        </div>
                    )}
                </div>
                {showColumnToggle && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto">
                                <Settings2 className="h-4 w-4" />
                                Cột
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="font-medium">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: pageSize }).map((_, index) => (
                                <TableRow key={index}>
                                    {columns.map((_, cellIndex) => (
                                        <TableCell key={cellIndex} className="h-12">
                                            <div className="h-4 bg-muted animate-pulse rounded" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="hover:bg-muted/50"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Enhanced Pagination */}
            {showPagination && (
                <div className="flex items-center justify-between px-2">
                    <div className="flex-1 text-sm text-muted-foreground">
                        {table.getFilteredSelectedRowModel().rows.length > 0 && (
                            <>
                                {table.getFilteredSelectedRowModel().rows.length} trong{" "}
                                {table.getFilteredRowModel().rows.length} hàng được chọn.
                            </>
                        )}
                        {totalItems && (
                            <span className="ml-4">
                                Tổng cộng: {totalItems} mục
                            </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-6 lg:space-x-8">
                        <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium">Hiển thị</p>
                            <select
                                value={table.getState().pagination.pageSize}
                                onChange={(e) => {
                                    const newPageSize = Number(e.target.value)
                                    table.setPageSize(newPageSize)
                                    onPageSizeChange?.(newPageSize)
                                }}
                                className="h-8 w-[70px] rounded border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                {[10, 20, 30, 40, 50].map((pageSize) => (
                                    <option key={pageSize} value={pageSize}>
                                        {pageSize}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Page Navigation */}
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => {
                                    table.setPageIndex(0)
                                    onPageChange?.(1)
                                }}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Trang đầu</span>
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                    table.previousPage()
                                    onPageChange?.(table.getState().pagination.pageIndex)
                                }}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Trang trước</span>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            {/* Page Numbers */}
                            <div className="flex items-center space-x-1">
                                {generatePageNumbers().map((page, index) => (
                                    <React.Fragment key={index}>
                                        {page === '...' ? (
                                            <span className="px-2 text-muted-foreground">...</span>
                                        ) : (
                                            <Button
                                                variant={page === (currentPage || 1) ? "default" : "outline"}
                                                className="h-8 w-8 p-0"
                                                onClick={() => {
                                                    table.setPageIndex((page as number) - 1)
                                                    onPageChange?.(page as number)
                                                }}
                                            >
                                                {page}
                                            </Button>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                    table.nextPage()
                                    onPageChange?.(table.getState().pagination.pageIndex + 2)
                                }}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Trang tiếp</span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => {
                                    table.setPageIndex(table.getPageCount() - 1)
                                    onPageChange?.(table.getPageCount())
                                }}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Trang cuối</span>
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                            Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// Column helpers
export function createColumnHelper<T>() {
    return {
        accessor: <K extends keyof T>(key: K) => ({
            accessorKey: key as string,
            id: key as string,
        }),
        display: (id: string) => ({
            id,
        }),
    }
} 