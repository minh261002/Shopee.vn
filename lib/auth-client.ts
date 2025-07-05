import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [emailOTPClient()],
});

export type Session = typeof authClient.$Infer.Session & {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    role: "ADMIN" | "SELLER" | "USER";
    createdAt: Date;
    updatedAt: Date;
  };
};
