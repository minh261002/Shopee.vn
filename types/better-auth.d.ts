// types/better-auth.d.ts
import "better-auth";

declare module "better-auth" {
  interface DefaultUser {
    role: "ADMIN" | "SELLER" | "USER";
    createdAt: Date;
    updatedAt: Date;
  }

  interface DefaultSession {
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
  }
}
