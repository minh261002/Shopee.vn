"use client";

import { authClient } from "@/lib/auth-client";
import { ErrorContext } from "better-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useSignOut() {
  const router = useRouter();
  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          toast.success("Đăng xuất thành công");
        },
        onError: (error: ErrorContext) => {
          toast.error(error.error?.message || "Đăng xuất thất bại");
        },
      },
    });
  };
  return { handleSignOut };
}
