"use client"

import { AppSidebar } from "@/components/layouts/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { StorePendingDialog } from "@/components/layouts/store-pending-dialog"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import api from "@/lib/axios"

const DashboardLayout = ({
    children,
}: {
    children: React.ReactNode
}) => {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session } = authClient.useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [storePending, setStorePending] = useState(false);

    useEffect(() => {
        const checkStore = async () => {
            if (!session?.user) return;

            try {
                const response = await api.get('/stores/me');
                const store = response.data;

                if (store.status === 'PENDING_APPROVAL') {
                    setStorePending(true);
                }
            } catch (error) {
                console.error('Error checking store:', error);
                // Nếu không có store hoặc lỗi, redirect về trang đăng ký
                if (!pathname.startsWith('/seller-register')) {
                    router.push('/seller-register');
                }
            } finally {
                setIsLoading(false);
            }
        };

        checkStore();
    }, [session, router, pathname]);

    if (isLoading) {
        return null; // hoặc loading spinner
    }

    return (
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
            {storePending && <StorePendingDialog />}
        </SidebarProvider>
    )
}

export default DashboardLayout