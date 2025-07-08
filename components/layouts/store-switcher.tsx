"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Store as StoreIcon, Plus } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { useStore } from '@/providers/store-context'
import Link from 'next/link'

export function StoreSwitcher() {
    const { stores, currentStore, setCurrentStore, isLoading } = useStore()
    const { isMobile } = useSidebar()

    if (isLoading) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" className="animate-pulse">
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted" />
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <div className="h-4 w-24 bg-muted rounded" />
                            <div className="h-3 w-16 bg-muted rounded mt-1" />
                        </div>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        )
    }

    if (!stores.length) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" asChild>
                        <Link href="/seller-register">
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                <Plus className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">Tạo cửa hàng</span>
                                <span className="truncate text-xs">Chưa có cửa hàng nào</span>
                            </div>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        )
    }

    if (!currentStore) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg">
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted">
                            <StoreIcon className="size-4" />
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">Chọn cửa hàng</span>
                            <span className="truncate text-xs">Không có cửa hàng được chọn</span>
                        </div>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        )
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'Hoạt động'
            case 'PENDING_APPROVAL':
                return 'Chờ duyệt'
            case 'SUSPENDED':
                return 'Tạm ngưng'
            default:
                return status
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-500'
            case 'PENDING_APPROVAL':
                return 'bg-yellow-500'
            case 'SUSPENDED':
                return 'bg-red-500'
            default:
                return 'bg-gray-500'
        }
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                <StoreIcon className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{currentStore.name}</span>
                                <span className="truncate text-xs">{getStatusText(currentStore.status)}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-xs text-muted-foreground">Cửa hàng của bạn</DropdownMenuLabel>
                        {stores.map((store, index) => (
                            <DropdownMenuItem
                                key={store.id}
                                onClick={() => setCurrentStore(store)}
                                className="gap-2 p-2"
                            >
                                <div className="flex size-6 items-center justify-center rounded-sm border">
                                    <StoreIcon className="size-4 shrink-0" />
                                </div>
                                <div className="flex flex-col flex-1">
                                    <span className="font-medium">{store.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {store.type} • {store.totalProducts} sản phẩm
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className={`w-2 h-2 rounded-full ${getStatusColor(store.status)}`} />
                                    {currentStore?.id === store.id && (
                                        <Check className="size-4 text-green-500" />
                                    )}
                                </div>
                                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 p-2" asChild>
                            <Link href="/seller-register">
                                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                                    <Plus className="size-4" />
                                </div>
                                <div className="font-medium text-muted-foreground">Tạo cửa hàng mới</div>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
} 