import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { admin } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { resend } from "./resend";
import { User } from "@prisma/client";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mysql",
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
      },
    },
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        await resend.emails.send({
          from: "Shopee VN <onboarding@resend.dev>",
          to: [email],
          subject: "Verify your email",
          html: `<p>Your OTP is ${otp}</p>`,
        });
      },
    }),
    admin({
      defaultRole: "USER",
      sellerRoles: ["SELLER"],
      adminRoles: ["ADMIN"],
    }),
  ],
  callbacks: {
    async redirect({ user }: { user: User }) {
      switch (user.role) {
        case "ADMIN":
          return "/admin/dashboard";
        case "SELLER":
          return "/seller/dashboard";
        default:
          return "/";
      }
    },
  },
});
