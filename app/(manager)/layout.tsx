"use client"

import { AppSidebar } from "@/components/layouts/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { StoreProvider } from "@/providers/store-context"
import { authClient } from "@/lib/auth-client"
import Loading from "@/app/loading"

const DashboardLayout = ({
    children,
}: {
    children: React.ReactNode
}) => {
    const { isPending } = authClient.useSession();
    if (isPending) {
        return (
            <Loading />
        )
    }
    return (
        <StoreProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-border">
                        <div className="w-full flex items-center justify-between gap-2 px-4">
                            <SidebarTrigger className="-ml-1" />
                        </div>
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-4 py-10">
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </StoreProvider>
    )
}

export default DashboardLayout