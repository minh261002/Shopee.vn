"use client";

import { authClient } from "@/providers/auth-client";
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
          toast.success("Logged out successfully");
        },
        onError: (error: ErrorContext) => {
          toast.error(error.error?.message || "Failed to sign out");
        },
      },
    });
  };
  return { handleSignOut };
}
