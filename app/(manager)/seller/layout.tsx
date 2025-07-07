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
        <>
            {storePending && <StorePendingDialog />}
            {children}
        </>
    )
}

export default SellerLayout 