"use client"

import { Row } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DataTableRowActionsProps<TData> {
    row: Row<TData>
    actions: {
        label: string
        onClick: (data: TData) => void
        icon?: React.ComponentType<{ className?: string }>
        variant?: "default" | "destructive"
        separator?: boolean
        confirmMessage?: string
        confirmTitle?: string
    }[]
}

export function DataTableRowActions<TData>({
    row,
    actions,
}: DataTableRowActionsProps<TData>) {
    const [isAlertOpen, setIsAlertOpen] = useState(false)
    const [pendingAction, setPendingAction] = useState<{
        action: (data: TData) => void
        title: string
        message: string
    } | null>(null)

    const handleActionClick = (action: DataTableRowActionsProps<TData>["actions"][0]) => {
        if (action.variant === "destructive") {
            setPendingAction({
                action: action.onClick,
                title: action.confirmTitle || "Xác nhận xóa",
                message: action.confirmMessage || "Bạn có chắc chắn muốn xóa item này? Hành động này không thể hoàn tác."
            })
            setIsAlertOpen(true)
        } else {
            action.onClick(row.original)
        }
    }

    const handleConfirm = () => {
        if (pendingAction) {
            pendingAction.action(row.original)
            setPendingAction(null)
        }
        setIsAlertOpen(false)
    }

    const handleCancel = () => {
        setPendingAction(null)
        setIsAlertOpen(false)
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Mở menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                    {actions.map((action, index) => (
                        <div key={index}>
                            {action.separator && <DropdownMenuSeparator />}
                            <DropdownMenuItem
                                onClick={() => handleActionClick(action)}
                                className={
                                    action.variant === "destructive"
                                        ? "text-destructive focus:text-destructive"
                                        : ""
                                }
                            >
                                {action.icon && (
                                    <action.icon className="mr-2 h-4 w-4" />
                                )}
                                {action.label}
                            </DropdownMenuItem>
                        </div>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {pendingAction?.title}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {pendingAction?.message}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancel}>
                            Hủy
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
} 