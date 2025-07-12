"use client"

import { StorePendingDialog } from "@/components/layouts/store-pending-dialog"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import api from "@/lib/axios"

const SellerLayout = ({
    children,
}: {
    children: React.ReactNode
}) => {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session } = authClient.useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [storePending, setStorePending] = useState(false);
    const [storeStatus, setStoreStatus] = useState<string | null>(null);

    useEffect(() => {
        const checkStore = async () => {
            if (!session?.user) return;

            try {
                const response = await api.get('/stores/me');
                const stores = response.data.stores || [];

                if (stores.length === 0) {
                    // Không có store nào, redirect về đăng ký
                    if (!pathname.startsWith('/seller-register')) {
                        router.push('/seller-register');
                    }
                    return;
                }

                const currentStore = stores[0]; // Lấy store đầu tiên
                setStoreStatus(currentStore.status);

                if (currentStore.status === 'PENDING_APPROVAL') {
                    setStorePending(true);
                    // Chặn tất cả các trang trừ dashboard và register
                    if (!pathname.startsWith('/seller-register') && pathname !== '/seller/dashboard') {
                        router.push('/seller/dashboard');
                    }
                } else if (currentStore.status === 'SUSPENDED' || currentStore.status === 'CLOSED') {
                    // Store bị khóa hoặc đóng, chỉ cho phép xem dashboard
                    setStorePending(true);
                    if (!pathname.startsWith('/seller-register') && pathname !== '/seller/dashboard') {
                        router.push('/seller/dashboard');
                    }
                } else if (currentStore.status === 'ACTIVE') {
                    // Store đã được duyệt, cho phép tất cả thao tác
                    setStorePending(false);
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
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <>
            {storePending && storeStatus && (
                <StorePendingDialog status={storeStatus as 'PENDING_APPROVAL' | 'SUSPENDED' | 'CLOSED'} />
            )}
            {children}
        </>
    )
}

export default SellerLayout 