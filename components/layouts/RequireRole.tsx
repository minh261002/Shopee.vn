"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useEffect } from "react";

export function RequireRole({ role, children }: { role: string; children: React.ReactNode }) {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();
    const userRole = (session?.user as { role?: string })?.role;

    useEffect(() => {
        if (isPending) return;

        if (userRole === "ADMIN") {
            router.push("/admin");
        } else if (userRole === "SELLER") {
            router.push("/seller");
        } else {
            router.push("/");
        }
    }, [userRole, isPending, role, router]);

    if (isPending) return;

    return <>{children}</>;
}